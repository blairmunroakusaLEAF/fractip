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
        program::invoke_signed,
        system_instruction,
        msg,
    };
use bit_vec::BitVec;
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
        bumpREF: u8,
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
        let systemProgramID = next_account_info(account_info_iter)?;

        // calculate rent
        let rentPIECE = Rent::from_account_info(rent)?
            .minimum_balance(SIZE_PIECE.into());
        let rentREF = Rent::from_account_info(rent)?
            .minimum_balance(SIZE_REF.into());

        // check to make sure tx operator is signer
        if !operator.is_signer {
            return Err(ProgramError::MissingRequiredSignature);
        }

        // get PIECE info
        let mut PIECEinfo = PIECE::unpack_unchecked(&pdaPIECE.try_borrow_data()?)?;
        // get PIECE flags
        let mut PIECEflags = unpack_flags(PIECEinfo.flags);

        // calculate available lamports in PIECE
        let mut lampPayable = pdaPIECE.try_lamports().unwrap() - rentPIECE;
        msg!("{:?}", lampPayable);

        // if there's nothing to pay, there's nothing to do or payment done, not busy
        if lampPayable == 0 {

            // ensure lower busy flag and abort remaining incoming tx
            PIECEflags.set(9, false);
            PIECE::pack(PIECEinfo, &mut pdaPIECE.try_borrow_mut_data()?)?;
            msg!("All done, or nothing to do.");

            return Ok(())
        } else {

            PIECEflags.set(9, true);
            PIECE::pack(PIECEinfo, &mut pdaPIECE.try_borrow_mut_data()?)?;
        }

        // verify ref is authentic
        let mut pdaPIECEstring = &pdaPIECE.key.to_string();
        if &seedREF[0..(PUBKEY_LEN - COUNT_LEN)] != pdaPIECEstring[0..(PUBKEY_LEN - COUNT_LEN)].as_bytes() {
            // need to test this logic statement by creating bogus tx
            return Err(FracpayError::REFNotOwnedError.into());
        }

        // verify seed was not spoofed
        let (pdaREFcheck, _) = Pubkey::find_program_address(&[&seedREF], &program_id);
        if pdaREFcheck != *pdaREF.key {
            return Err(FracpayError::REFNotOwnedError.into());
        }

        // get REF info
        let mut REFinfo = REF::unpack_unchecked(&pdaREF.try_borrow_data()?)?;
        // get REF flags
        let mut REFflags = unpack_flags(REFinfo.flags);

        // get selfREF info
        let mut selfREFinfo = REF::unpack_unchecked(&pdaselfREF.try_borrow_data()?)?;
        // get REF flags
        let mut selfREFflags = unpack_flags(selfREFinfo.flags);

        // get target info if connected
        if REFflags[5] {
            let mut TARGETinfo = PIECE::unpack_unchecked(&pdaTARGET.try_borrow_data()?)?;
            // get target flags
            let mut TARGETflags = unpack_flags(TARGETinfo.flags);
        };

        // check selfref and piece flipflops are same
        if PIECEflags[8] != selfREFflags[8] {
            return Err(FracpayError::FlipflopMismatchError.into());
        }

        // check ref to see if alreaady paid
        if PIECEflags[8] != REFflags[8] {
            return Err(FracpayError::AlreadyPaidError.into());
        }



        msg!("{:?}", payment);

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

