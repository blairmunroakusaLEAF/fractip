/****************************************************************
 * Fracpay server InitREF instruction process 
 * blairmunroakusa@.0322.anch.AK			    
 ****************************************************************/

#![allow(non_snake_case)]
use solana_program::{
        account_info::{
            AccountInfo,
            next_account_info,
        },
        sysvar::{
            rent::Rent,
            Sysvar,
        },
        entrypoint::ProgramResult,
        program_error::ProgramError,
        program_pack::Pack,
        pubkey::Pubkey,
        system_instruction,
        msg,
    };
//use bit_vec::BitVec;
use crate::{
        processor::{
            run::Processor,
            utility::*,
        },
        state::{
            PIECE::*,
            REF::*,
            constants::*,
        },
        error::*,
    };

impl Processor {

    pub fn process_fracpay_piece(
        program_id: &Pubkey,
        accounts: &[AccountInfo],
        seedREF: Vec<u8>,
    ) -> ProgramResult {
        
        // get accounts
        let account_info_iter = &mut accounts.iter();

        let operator = next_account_info(account_info_iter)?;
        let rent = next_account_info(account_info_iter)?;
        let pdaselfTARGET = next_account_info(account_info_iter)?;
        let pdaTARGET = next_account_info(account_info_iter)?;
        let pdaPIECE = next_account_info(account_info_iter)?;
        let pdaselfREF = next_account_info(account_info_iter)?;
        let pdaREF = next_account_info(account_info_iter)?;

        // check to make sure tx operator is signer
        if !operator.is_signer {
            return Err(ProgramError::MissingRequiredSignature);
        }

        // verify ref is authentic
        let pdaPIECEstring = &pdaPIECE.key.to_string();
        if &seedREF[0..(PUBKEY_LEN - COUNT_LEN)] != pdaPIECEstring[0..(PUBKEY_LEN - COUNT_LEN)].as_bytes() {
            // need to test this logic statement by creating bogus tx
            return Err(FracpayError::REFNotOwnedError.into());
        }

        // get REF info
        let mut REFinfo = REF::unpack_unchecked(&pdaREF.try_borrow_data()?)?;
        // get REF flags
        let mut REFflags = unpack_flags(REFinfo.flags);

        // verify TARGET is correct
        // TODO create error for this event
        if pdaTARGET.key != &REFinfo.target {
            return Err(FracpayError::REFNotOwnedError.into());
        }

        // get PIECE info
        let mut PIECEinfo = PIECE::unpack_unchecked(&pdaPIECE.try_borrow_data()?)?;
        // get PIECE flags
        let mut PIECEflags = unpack_flags(PIECEinfo.flags);

        // verify seed was not spoofed
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
            if !PIECEflags[9] {
                PIECEflags.set(9, true);
                PIECEinfo.balance = lampPayable;
                PIECEinfo.left = lampPayable;
                // Pff, piece flipflop
                if PIECEflags[8] {
                    PIECEflags.set(8, false);
                } else {
                    PIECEflags.set(8, true);
                }
            }
        }

        // get selfREF info
        let selfREFinfo = REF::unpack_unchecked(&pdaselfREF.try_borrow_data()?)?;

        // get target info, or invitation key
        let mut TARGETinfo = PIECE::unpack_unchecked(&pdaTARGET.try_borrow_data()?)?;
        // get target flags
        let TARGETflags = unpack_flags(TARGETinfo.flags);

        // check ref to see if alreaady paid
        if PIECEflags[8] == REFflags[8] {
            //TODO may need to make this return Ok(())
            return Err(FracpayError::AlreadyPaidError.into());
        };

        // now it is established that Pff != Rff
        // first get REF lamport balance
        let lampREF = pdaREF.try_lamports().unwrap() - rentREF;

        // process payment for connected and disconnected cases
        if PIECEflags[9] {  // if busy
            if PIECEflags[5] { // if connected

                // transfer lamports found at REF
                if lampREF != 0 {
                    system_instruction::transfer(
                        &pdaREF.key,
                        &pdaTARGET.key,
                        lampREF);
                }

                // transfer lamport fraction from PIECE
                system_instruction::transfer(
                    &pdaPIECE.key,
                    &pdaTARGET.key,
                    PIECEinfo.balance * (REFinfo.fract as u64) / 100_000_000);

                // check if TARGET is busy, if not, increment balance
                // (else, just deposit lamports and TARGET
                if !TARGETflags[9] {
                    TARGETinfo.balance += PIECEinfo.balance * (REFinfo.fract as u64) / 100_000_000 + lampREF;
                }

                // update PIECE-side counters
                REFinfo.netsum += PIECEinfo.balance * (REFinfo.fract as u64) / 100_000_000 + lampREF;
                PIECEinfo.left -= PIECEinfo.balance * (REFinfo.fract as u64);

            } else { // if disconnected

                // transfer lamports
                 system_instruction::transfer(
                     &pdaPIECE.key,
                     &pdaREF.key,
                     PIECEinfo.balance * (REFinfo.fract as u64) / 100_000_000);

                // update counters
                REFinfo.netsum = PIECEinfo.balance * (REFinfo.fract as u64) / 100_000_000 + lampREF;
                PIECEinfo.left -= PIECEinfo.balance * (REFinfo.fract as u64);
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

        // final test, was this last tx?
        if PIECEinfo.left == 0 {
            PIECEflags.set(9, false);
            PIECEinfo.balance = 0;
        }

        // repack state variables
        PIECEinfo.flags = pack_flags(PIECEflags);
        PIECE::pack(PIECEinfo, &mut pdaPIECE.try_borrow_mut_data()?)?;

        TARGETinfo.flags = pack_flags(TARGETflags);
        PIECE::pack(TARGETinfo, &mut pdaTARGET.try_borrow_mut_data()?)?;

        REFinfo.flags = pack_flags(REFflags);
        REF::pack(REFinfo, &mut pdaREF.try_borrow_mut_data()?)?;
























        //msg!("{:?}", payment);

/*
        // check to make sure tx operator is authorized PIECE operator
        if PIECEinfo.operator != *operator.key {
            msg!("Operator doesn't control PIECE.");
            return Err(ProgramError::MissingRequiredSignature);
        }




        // generate self REF seed to verify pda
        let mut verifyseed = pda.PIECE.key.to_string();
        let verifyseed: &mut Vec<u8> = &mut verifyseed[0..30].as_bytes().to_vec();
        let mut zeros: Vec<u8> = vec![0; COUNT_LEN];
        verifyseed.append(&mut zeros);
        let selfREFverify = Pubkey::create_program_address(
            &[&verifyseed, &[selfseed]], &program_id)?;

        // get self REF info, and remaining portion fraction
        let mut selfREFinfo = REF::unpack_unchecked(&pdaselfREF.try_borrow_data()?)?;
        let mut remainder = selfREFinfo.fract;
        let available = remainder + REFinfo.fract;

        // check to make sure fraction doesn't exceed available
        if fract > available {
            msg!("Client is demanding fraction that exceeds available portion.");
            return Err(InvalidInstruction.into());
        }

        // check self REF is right
        if *pdaselfREF.key != selfREFverify {
            msg!("The self ref this tx is referring belongs to a different PIECE.");
            return Err(InvalidInstruction.into());
        }

        // get REF flags
        let mut REFflags = unpack_flags(REFinfo.flags);

        // set REF target, invite key or address depending on client needs
        REFinfo.target = *invitarget.key;

        // set REF fraction
        REFinfo.fract = fract;

        // adjust self REF remainder fraction
        remainder = available - fract;

        // set modified self REF remainder fraction
        selfREFinfo.fract = remainder;

        // parse invite tag
        match invite {
            // no invite, connected to target address
            0 => {
                REFflags.set(5, true); // REF is connected
                REFflags.set(6, false); // REF is not an invitation
            },
            1 => {
                REFflags.set(5, false); // REF is disconnected
                REFflags.set(6, true); // REF is an invitation
            },
            _ => {
                msg!("Invalid instruction invite tag.");
                return Err(InvalidInstruction.into());
            },
        }

        // set initialized flag
        REFflags.set(4, true);

        // repack all self REF info
        REF::pack(selfREFinfo, &mut pdaselfREF.try_borrow_mut_data()?)?;

        // repack all REF info
        REFinfo.flags = pack_flags(REFflags);
        REF::pack(REFinfo, &mut pda.REF.try_borrow_mut_data()?)?;
*/
        Ok(())
    }
}

