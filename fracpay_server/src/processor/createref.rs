/****************************************************************
 * Fracpay server CreateREF instruction process    	   
 * blairmunroakusa@.0322.anch.AK			     
 ****************************************************************/

#![allow(non_snake_case)]
use solana_program::{
        msg,
        system_instruction,
        account_info::{
            next_account_info,
            AccountInfo
        },
        entrypoint::ProgramResult,
        program::invoke_signed,
        program_error::ProgramError,
        program_pack::Pack,
        pubkey::Pubkey,
        sysvar::{
            Sysvar,
            rent::Rent,
        },
    };
use bit_vec::BitVec;
use std::array::TryFromSliceError;
use crate::{
        error::FracpayError,
        state::{
            constants::*,
            MAIN::*,
            PIECE::*,
            REF::*,
        },
    };

use crate::processor::{
        run::Processor,
        utility::*,
    };

impl Processor {

    pub fn process_create_ref(
        program_id: &Pubkey,
        accounts: &[AccountInfo],
        bumpREF: u8,
        seedREF: Vec<u8>,
        REFslug: Vec<u8>,
    ) -> ProgramResult {

        let account_info_iter = &mut accounts.iter();
        
        // account #1
        let operator = next_account_info(account_info_iter)?;

        // check to make sure tx operator is signer
        if !operator.is_signer {
            return Err(ProgramError::MissingRequiredSignature);
        }
        
        // account #2
        let rent = &Rent::from_account_info(next_account_info(account_info_iter)?)?;

        // account #3
        let pdaMAIN = next_account_info(account_info_iter)?;

        // check to make sure tx operator is authorized MAIN operator
        let MAINinfo = MAIN::unpack_unchecked(&pdaMAIN.try_borrow_data()?)?;
        if MAINinfo.operator != *operator.key {
            msg!("operator doesn't control MAIN.");
            return Err(ProgramError::MissingRequiredSignature);
        }

        // account #4
        let pdaPIECE = next_account_info(account_info_iter)?;

        // check to make sure tx operator is authorized PIECE operator
        let mut PIECEinfo = PIECE::unpack_unchecked(&pdaPIECE.try_borrow_data()?)?;
        if PIECEinfo.operator != *operator.key {
            msg!("Operator doesn't control PIECE.");
            return Err(ProgramError::MissingRequiredSignature);
        }

        // make sure seed is correct count number
        let numbertag = &seedREF[30..];
        let REFnumber = ((numbertag[0] as u16) << 8) | numbertag[1] as u16;
        if PIECEinfo.refcount != (REFnumber - 1) {
            msg!{"This REF pda is out of order."}
            return Err(FracpayError::AccountCreationAttemptError.into());
        }

        // account #5
        let pdaREF = next_account_info(account_info_iter)?;

        // prep to create self REF pda
        let rentREF = rent.minimum_balance(SIZE_REF.into());

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
        PIECEinfo.refcount = REFnumber;
        PIECE::pack(PIECEinfo, &mut pdaPIECE.try_borrow_mut_data()?)?;

        // initialize REF account data

        let mut REFinfo = REF::unpack_unchecked(&pdaREF.try_borrow_data()?)?;

        let mut FLAGS = BitVec::from_elem(16, false);
        FLAGS.set(0, false); // REF account is 0100
        FLAGS.set(1, true);  
        FLAGS.set(2, false);
        FLAGS.set(3, false); 
        FLAGS.set(4, false); // not connected
        FLAGS.set(5, false); // not initialized
        FLAGS.set(6, false); // not reflected

        REFinfo.flags = pack_flags(FLAGS);
        REFinfo.target = *operator.key;
        REFinfo.fract = 0;  // new ref get's 0% by default
        REFinfo.netsum = 0;
        {
            type VecInput = Vec<u8>;
            type RefslugOutput = [u8; REFSLUG_LEN];
            let mut REFslug_bytes: Vec<u8>;
            fn package_slug(vector: VecInput) -> Result<RefslugOutput, TryFromSliceError> {
                vector.as_slice().try_into()
            }
            REFslug_bytes = REFslug.to_vec();
            let mut zeros: Vec<u8> = vec![0; REFSLUG_LEN - REFslug_bytes.len()];
            REFslug_bytes.append(&mut zeros);
            REFinfo.refslug = package_slug(REFslug_bytes).unwrap();
        }

        REF::pack(REFinfo, &mut pdaREF.try_borrow_mut_data()?)?;


        Ok(())
    }
}

