/****************************************************************
 * Fracpay server CreateREF instruction process    	   
 * blairmunroakusa@.0322.anch.AK			     
 ****************************************************************/

#![allow(non_snake_case)]
use solana_program::{
        account_info::{
            AccountInfo,
            next_account_info,
        },
        entrypoint::ProgramResult,
        program::invoke_signed,
        program_error::ProgramError,
        program_pack::Pack,
        pubkey::Pubkey,
        sysvar::{
            rent::Rent,
            Sysvar,
        },
        system_instruction,
        msg,
    };
use bit_vec::BitVec;
use crate::{
        error::FracpayError,
        processor::{
            run::Processor,
            utility::*,
        },
        state::{
            constants::*,
            MAIN::*,
            PIECE::*,
            REF::*,
        },
    };

impl Processor {

    pub fn process_create_ref(
        program_id: &Pubkey,
        accounts: &[AccountInfo],
        bumpREF: u8,
        seedREF: Vec<u8>,
        REFslug: Vec<u8>,
    ) -> ProgramResult {

        // get accounts
        let account_info_iter = &mut accounts.iter();

        let operator    = next_account_info(account_info_iter)?;
        let rent        = next_account_info(account_info_iter)?;
        let pdaMAIN     = next_account_info(account_info_iter)?;
        let pdaPIECE    = next_account_info(account_info_iter)?;
        let pdaREF      = next_account_info(account_info_iter)?;

        // check to make sure tx operator is signer
        if !operator.is_signer {
            return Err(ProgramError::MissingRequiredSignature);
        }

        // get MAIN info
        let MAINinfo = MAIN::unpack_unchecked(&pdaMAIN.try_borrow_data()?)?;

        // check to make sure tx operator is authorized MAIN operator
        if MAINinfo.operator != *operator.key {
            msg!("operator doesn't control MAIN.");
            return Err(ProgramError::MissingRequiredSignature);
        }

        // get PIECE info
        let mut PIECEinfo = PIECE::unpack_unchecked(&pdaPIECE.try_borrow_data()?)?;
        
        // check to make sure tx operator is authorized PIECE operator
        if PIECEinfo.operator != *operator.key {
            msg!("Operator doesn't control PIECE.");
            return Err(ProgramError::MissingRequiredSignature);
        }

        // make sure seed is correct count number
        if PIECEinfo.refcount != (check_seed(&seedREF) - 1) {
            msg!{"This REF pda is out of order."}
            return Err(FracpayError::AccountCreationAttemptError.into());
        }

        // calculate rent
        let rentREF = Rent::from_account_info(rent)?
            .minimum_balance(SIZE_REF.into());

        // create pdaREF
        invoke_signed(
        &system_instruction::create_account(
            &operator.key,
            &pdaREF.key,
            rentREF,
            SIZE_REF.into(),
            program_id
        ),
        &[
            operator.clone(),
            pdaREF.clone()
        ],
        &[&[&seedREF, &[bumpREF]]]
        )?;
        msg!("Successfully created pdaREF");

        // update REF count
        PIECEinfo.refcount = PIECEinfo.refcount + 1;
        PIECE::pack(PIECEinfo, &mut pdaPIECE.try_borrow_mut_data()?)?;

        // get REF info
        let mut REFinfo = REF::unpack_unchecked(&pdaREF.try_borrow_data()?)?;

        // set flags
        let mut flags = BitVec::from_elem(16, false);
        flags.set(0, false); // REF account is 0100
        flags.set(1, true);  
        flags.set(2, false);
        flags.set(3, false); 
        flags.set(4, false); // not initialized

        // initialize REF account data
        REFinfo.flags = pack_flags(flags);
        REFinfo.target = *pdaMAIN.key;
        REFinfo.fract = 0;  // new ref get's 0% by default
        REFinfo.netsum = 0;
        REFinfo.refslug = pack_refslug(REFslug);
        REF::pack(REFinfo, &mut pdaREF.try_borrow_mut_data()?)?;

        Ok(())
    }
}

