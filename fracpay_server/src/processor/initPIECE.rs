/****************************************************************
 * Fracpay server InitPIECE instruction process 
 * blairmunroakusa@.0322.anch.AK			    
 ****************************************************************/

#![allow(non_snake_case)]
use solana_program::{
        account_info::AccountInfo,
        entrypoint::ProgramResult,
        program_error::ProgramError,
        program_pack::Pack,
        pubkey::Pubkey,
        msg,
    };
use crate::{
        processor::{
            run::Processor,
            utility::*,
        },
        state::{
            PIECE::*,
            REF::*,
        },
        error::FracpayError::InvalidInstruction,
    };

impl Processor {

    pub fn process_init_piece<'a>(
        _program_id: &Pubkey,
        accounts: &'a [AccountInfo<'a>],
        invite: u8,
    ) -> ProgramResult {

        // get accounts
        let (operator, invitarget, pda) = get_accounts(accounts)?;

        // check to make sure tx operator is signer
        if !operator.is_signer {
            return Err(ProgramError::MissingRequiredSignature);
        }
       
        // get PIECE info
        let mut PIECEinfo = PIECE::unpack_unchecked(&pda.PIECE.try_borrow_data()?)?;

        // check to make sure tx operator is authorized PIECE operator
        if PIECEinfo.operator != *operator.key {
            msg!("Operator doesn't control PIECE.");
            return Err(ProgramError::MissingRequiredSignature);
        }

        // get piece flags
        let mut PIECEflags = unpack_flags(PIECEinfo.flags);

        // get self REF info
        let mut REFinfo = REF::unpack_unchecked(&pda.REF.try_borrow_data()?)?;

        // get self REF flags
        let mut REFflags = unpack_flags(REFinfo.flags);

        // parse invite tag
        match invite {
            // no invite connect self REF to MAIN
            0 => { 
                PIECEflags.set(5, true); // PIECE and self REF is connected
                REFflags.set(5, true);
                PIECEflags.set(6, false); // PIECE and self REF not an invitation
                REFflags.set(6, false);
                REFflags.set(0, true); // self REF directs income to a MAIN account
                REFflags.set(2, false);
                REFinfo.target = *pda.MAIN.key;
            },
            // yes invite (to create MAIN and collect from PIECE)
            1 => {
                PIECEflags.set(5, false); // PIECE and self REF is disconnected
                REFflags.set(5, false);
                PIECEflags.set(6, true); // PIECE and self REF is an invitation
                REFflags.set(6, true);
                REFinfo.target = *invitarget.key;
            },
            // gift to known MAIN
            2 => {
                PIECEflags.set(5, true); // PIECE and self REF is connected
                REFflags.set(5, true);
                PIECEflags.set(6, false); // PIECE and self REF not an invitation
                REFflags.set(6, false);
                REFflags.set(0, true); // self REF directs income to a MAIN account
                REFflags.set(2, false);
                REFinfo.target = *invitarget.key;
            },
            _ => {
                msg!("Invalid instruction invite tag.");
                return Err(InvalidInstruction.into());
            },
        }

        // set initialized flag
        PIECEflags.set(4, true);
        REFflags.set(4, true);

        // repack all self REF info
        REFinfo.flags = pack_flags(REFflags);
        REF::pack(REFinfo, &mut pda.REF.try_borrow_mut_data()?)?;

        // repack all piece info
        PIECEinfo.flags = pack_flags(PIECEflags);
        PIECE::pack(PIECEinfo, &mut pda.PIECE.try_borrow_mut_data()?)?;

        Ok(())
    }
}

