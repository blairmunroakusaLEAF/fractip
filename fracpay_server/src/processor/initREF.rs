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
        msg,
    };
use crate::{
        error::error::FracpayError::InvalidInstruction,
        processor::run::Processor,
        processor::utility::*,
        state::PIECE::*,
        state::REF::*,
        state::constants::*,
    };

impl Processor {

    pub fn process_init_ref(
        program_id: &Pubkey,
        accounts:   &[AccountInfo],
        invite:     u8,
        selfseed:   u8,
        fract:      u32,
    ) -> ProgramResult {

        // get accounts
        let account_info_iter = &mut accounts.iter();

        let operator    = next_account_info(account_info_iter)?;
        let invitarget  = next_account_info(account_info_iter)?;
        let _pdaMAIN    = next_account_info(account_info_iter)?;
        let pdaPIECE    = next_account_info(account_info_iter)?;
        let pdaREF      = next_account_info(account_info_iter)?;
        let pdaselfREF  = next_account_info(account_info_iter)?;

        // check to make sure tx operator is signer
        if !operator.is_signer {
            msg!("Operator is not signer.");
            return Err(ProgramError::MissingRequiredSignature);
        }
       
        // get PIECE info
        let PIECEinfo = PIECE::unpack_unchecked(&pdaPIECE.try_borrow_data()?)?;

        // check to make sure tx operator is authorized PIECE operator
        if PIECEinfo.operator != *operator.key {
            msg!("Operator doesn't control PIECE.");
            return Err(ProgramError::MissingRequiredSignature);
        }

        // get REF info
        let mut REFinfo = REF::unpack_unchecked(&pdaREF.try_borrow_data()?)?;

        // generate self REF seed to verify pda
        let verifyseed = pdaPIECE.key.to_string();
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
        REF::pack(REFinfo, &mut pdaREF.try_borrow_mut_data()?)?;

        Ok(())
    }
}

