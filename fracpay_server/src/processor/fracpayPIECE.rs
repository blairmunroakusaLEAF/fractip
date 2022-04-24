/****************************************************************
 * Fracpay server InitREF instruction process 
 * blairmunroakusa@.0322.anch.AK			    
 ****************************************************************/

#![allow(non_snake_case)]
use solana_program::{
        account_info::AccountInfo,
        account_info::next_account_info,
        entrypoint::ProgramResult,
        program_error::ProgramError,
        program_pack::Pack,
        pubkey::Pubkey,
        sysvar::rent::Rent,
        sysvar::Sysvar,
        msg,
    };
//use bit_vec::BitVec;
use crate::{
        error::error::FracpayError,
        processor::run::Processor,
        processor::utility::*,
        state::MAIN::*,
        state::PIECE::*,
        state::REF::*,
        state::constants::*,
    };

impl Processor {

    pub fn process_fracpay_piece(
        program_id: &Pubkey,
        accounts:   &[AccountInfo],
        seedREF:    Vec<u8>,
    ) -> ProgramResult {
        
        // get accounts
        let account_info_iter = &mut accounts.iter();

        let operator        = next_account_info(account_info_iter)?;
        let rent            = next_account_info(account_info_iter)?;
        let _pdaselfTARGET  = next_account_info(account_info_iter)?;    // reserved for reflection feature
        let pdaTARGET       = next_account_info(account_info_iter)?;
        let pdaPIECE        = next_account_info(account_info_iter)?;
        let _pdaselfREF     = next_account_info(account_info_iter)?;    // reserved for reflection feature
        let pdaREF          = next_account_info(account_info_iter)?;

        // check to make sure tx operator is signer
        if !operator.is_signer {
            msg!("Operator is not signer.");
            return Err(ProgramError::MissingRequiredSignature);
        }

        // get REF info
        let mut REFinfo = REF::unpack_unchecked(&pdaREF.try_borrow_data()?)?;
        // get REF flags
        let mut REFflags = unpack_flags(REFinfo.flags);

        // verify TARGET is correct
        if pdaTARGET.key != &REFinfo.target {
            return Err(FracpayError::TargetMismatchError.into());
        }


        // get PIECE info
        let mut PIECEinfo = PIECE::unpack_unchecked(&pdaPIECE.try_borrow_data()?)?;
        // get PIECE flags
        let mut PIECEflags = unpack_flags(PIECEinfo.flags);
        
        // first sanity test, was this last tx?
        if PIECEinfo.left == 0 {
            PIECEflags.set(9, false);
            PIECEinfo.balance = 0;
        }

        // verify ref seed comes from piece
        let pdaPIECEstring = pdaPIECE.key.to_string();
        if &seedREF[0..(PUBKEY_LEN - COUNT_LEN)] != pdaPIECEstring[0..(PUBKEY_LEN - COUNT_LEN)].as_bytes() {
            // need to test this logic statement by creating bogus tx
            return Err(FracpayError::REFNotOwnedError.into());
        }

        // verify seed and piece was not spoofed
        let (pdaREFcheck, _) = Pubkey::find_program_address(&[&seedREF], &program_id);
        if pdaREFcheck != *pdaREF.key {
            return Err(FracpayError::REFNotOwnedError.into());
        }

        // calculate rent
        let rentPIECE = Rent::from_account_info(rent)?
            .minimum_balance(SIZE_PIECE.into());
        let rentREF = Rent::from_account_info(rent)?
            .minimum_balance(SIZE_REF.into());

        // calculate available lamports in PIECE
        let lampPayable = pdaPIECE.try_lamports().unwrap() - rentPIECE;
        msg!("{:?}", lampPayable);

        // if there's nothing to pay, there's nothing to do or payment done, not busy
        if lampPayable == 0 {

            // ensure lower busy flag to abort remaining incoming tx
            PIECEflags.set(9, false);
            PIECEinfo.flags = pack_flags(PIECEflags);
            PIECE::pack(PIECEinfo, &mut pdaPIECE.try_borrow_mut_data()?)?;
            msg!("All done, or nothing to do.");

            return Ok(())

        } else {

            // initiate payment now
            if !PIECEflags[9] {                     // if not already busy

                PIECEflags.set(9, true);            // indicate piece is busy paying out
                PIECEinfo.balance = lampPayable;    // sync balance up with lampPayable
                PIECEinfo.left = lampPayable;       // set countdown left variable
                
                // Pff, piece flipflop, to opposite of all refs (busy low implies all ff same)
                if PIECEflags[8] {
                    PIECEflags.set(8, false);
                } else {
                    PIECEflags.set(8, true);
                }
            }
        }

        // check ref to see if alreaady paid
        if PIECEflags[8] == REFflags[8] {
            msg!("REF already paid.");
            return Ok(())
        };

        // now it is established that Pff != Rff
        // first get REF lamport balance
        let lampREF = pdaREF.try_lamports().unwrap() - rentREF;

        // process payment for connected and disconnected cases
        if PIECEflags[9] {  // if busy


            if REFflags[0] &&
                !REFflags[1] &&
                !REFflags[2] &&
                !REFflags[3] { // if target is a MAIN account

                // get target info, or invitation key
                let mut TARGETinfo = MAIN::unpack_unchecked(&pdaTARGET.try_borrow_data()?)?;
    
                // transfer lamports found at REF
                if lampREF != 0 {
                    **pdaREF.try_borrow_mut_lamports()? -= lampREF;
                    **pdaTARGET.try_borrow_mut_lamports()? += lampREF;
                }

                // transfer lamport fraction from PIECE
                **pdaPIECE.try_borrow_mut_lamports()? -= PIECEinfo.balance * (REFinfo.fract as u64) / 100_000_000;
                **pdaTARGET.try_borrow_mut_lamports()? += PIECEinfo.balance * (REFinfo.fract as u64) / 100_000_000;

                // update PIECE-side counters
                TARGETinfo.balance += PIECEinfo.balance * (REFinfo.fract as u64) / 100_000_000 + lampREF;
                REFinfo.netsum += PIECEinfo.balance * (REFinfo.fract as u64) / 100_000_000 + lampREF;
                PIECEinfo.left -= PIECEinfo.balance * (REFinfo.fract as u64) / 100_000_000;
                
                MAIN::pack(TARGETinfo, &mut pdaTARGET.try_borrow_mut_data()?)?;

            } else { // target is PIECE, which may be busy (or REF, which will break)
                if REFflags[5] { // if connected
                    // get target info, or invitation key
                    let mut TARGETinfo = PIECE::unpack_unchecked(&pdaTARGET.try_borrow_data()?)?;
    
                    // get target flags
                    let TARGETflags = unpack_flags(TARGETinfo.flags);

                    // transfer lamports found at REF
                    if lampREF != 0 {
                    
                        **pdaREF.try_borrow_mut_lamports()? -= lampREF;
                        **pdaTARGET.try_borrow_mut_lamports()? += lampREF;
                    }

                    // transfer lamport fraction from PIECE
                    **pdaPIECE.try_borrow_mut_lamports()? -= PIECEinfo.balance * (REFinfo.fract as u64) / 100_000_000;
                    **pdaTARGET.try_borrow_mut_lamports()? += PIECEinfo.balance * (REFinfo.fract as u64) / 100_000_000;

                    // check if TARGET is busy, if not, increment balance
                    // (else, just deposit lamports and TARGET
                    if !TARGETflags[9] { // if not busy true
                        TARGETinfo.balance += PIECEinfo.balance * (REFinfo.fract as u64) / 100_000_000 + lampREF;
                    }

                    // update PIECE-side counters
                    REFinfo.netsum += PIECEinfo.balance * (REFinfo.fract as u64) / 100_000_000 + lampREF;
                    PIECEinfo.left -= PIECEinfo.balance * (REFinfo.fract as u64) / 100_000_000;

                    TARGETinfo.flags = pack_flags(TARGETflags);
                    PIECE::pack(TARGETinfo, &mut pdaTARGET.try_borrow_mut_data()?)?;
                
                } else { // if disconnected

                    // transfer lamports
                    **pdaPIECE.try_borrow_mut_lamports()? -= PIECEinfo.balance * (REFinfo.fract as u64) / 100_000_000;
                    **pdaREF.try_borrow_mut_lamports()? += PIECEinfo.balance * (REFinfo.fract as u64) / 100_000_000;

                    // update counters
                    REFinfo.netsum = pdaREF.try_lamports().unwrap() - rentREF;
                    PIECEinfo.left -= PIECEinfo.balance * (REFinfo.fract as u64) / 100_000_000;
                }
            }

            // Rff, REF flipflop
            if REFflags[8] {
                REFflags.set(8, false);
            } else {
                REFflags.set(8, true);
            }
        }

        // as for the selfREF, if connected, above logic applies, 
        // if disconnected, above logic applies
        msg!("{:?}", PIECEinfo.left);
        // final test, was this last tx?
        if PIECEinfo.left == 0 {
            PIECEflags.set(9, false);
            PIECEinfo.balance = 0;
        }

        // repack state variables
        PIECEinfo.flags = pack_flags(PIECEflags);
        PIECE::pack(PIECEinfo, &mut pdaPIECE.try_borrow_mut_data()?)?;


        REFinfo.flags = pack_flags(REFflags);
        REF::pack(REFinfo, &mut pdaREF.try_borrow_mut_data()?)?;


        Ok(())
    }
}

