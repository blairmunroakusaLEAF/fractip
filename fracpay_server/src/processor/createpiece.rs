/****************************************************************
 * Fracpay server CreatePIECE instruction process  
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

    pub fn process_create_piece(
        program_id: &Pubkey,
        accounts: &[AccountInfo],
        bumpPIECE: u8,
        seedPIECE: Vec<u8>,
        bumpREF: u8,
        seedREF: Vec<u8>,
        PIECEslug: Vec<u8>,
    ) -> ProgramResult {

        // get accounts
        let account_info_iter = &mut accounts.iter();

        let operator        = next_account_info(account_info_iter)?;
        let rent            = next_account_info(account_info_iter)?;
        let pdaMAIN         = next_account_info(account_info_iter)?;
        let pdaPIECE        = next_account_info(account_info_iter)?;
        let pdaREF          = next_account_info(account_info_iter)?;
        let pdaselfPIECE    = next_account_info(account_info_iter)?;

        // check to make sure tx operator is signer
        if !operator.is_signer {
            return Err(ProgramError::MissingRequiredSignature);
        }
        
        // get MAIN info
        let mut MAINinfo = MAIN::unpack_unchecked(&pdaMAIN.try_borrow_data()?)?;

        // check to make sure tx operator is authorized PIECE operator
        if MAINinfo.operator != *operator.key {
            msg!("Operator doesn't control MAIN.");
            return Err(ProgramError::MissingRequiredSignature);
        }

        // make sure seed is correct count number
        if MAINinfo.piececount != (check_seed(&seedPIECE) - 1) {
            msg!{"This piece pda is out of order."}
            return Err(FracpayError::AccountCreationAttemptError.into());
        }

        // calculate rent
        let rentPIECE = Rent::from_account_info(rent)?
            .minimum_balance(SIZE_PIECE.into());
        let rentREF = Rent::from_account_info(rent)?
            .minimum_balance(SIZE_REF.into());


        // create pdaPIECE
        invoke_signed(
        &system_instruction::create_account(
            &operator.key,
            &pdaPIECE.key,
            rentPIECE,
            SIZE_PIECE.into(),
            &program_id
        ),
        &[
            operator.clone(),
            pdaPIECE.clone()
        ],
        &[&[&seedPIECE, &[bumpPIECE]]]
        )?;
        msg!("Successfully created pdaPIECE");

        // create pdaREFself
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
        msg!("Successfully created pdaREFself");

        // update PIECE count
        MAINinfo.piececount = MAINinfo.piececount + 1;
        MAIN::pack(MAINinfo, &mut pdaMAIN.try_borrow_mut_data()?)?;

        // get PIECE info
        let mut PIECEinfo = PIECE::unpack_unchecked(&pdaPIECE.try_borrow_data()?)?;

        // set flags
        let mut flags = BitVec::from_elem(16, false);
        flags.set(0, false); // PIECE account is 0011
        flags.set(1, false);
        flags.set(2, true);
        flags.set(3, true);

        // initialize PIECE account data
        PIECEinfo.flags = pack_flags(flags);
        PIECEinfo.operator = *operator.key;
        PIECEinfo.balance = 0;
        PIECEinfo.netsum = 0;
        PIECEinfo.pieceslug = pack_pieceslug(PIECEslug);
        PIECE::pack(PIECEinfo, &mut pdaPIECE.try_borrow_mut_data()?)?;

        // get REF info
        let mut REFinfo = REF::unpack_unchecked(&pdaREF.try_borrow_data()?)?;

        // set flags
        let mut flags = BitVec::from_elem(16, false);
        flags.set(0, false); // REF self account is 0010
        flags.set(1, false);
        flags.set(2, true);
        flags.set(3, false); 

        // initialize self REF account data
        REFinfo.flags = pack_flags(flags);
        REFinfo.target = *pdaselfPIECE.key;
        REFinfo.fract = 100_000_000;    // new self-ref gets 100% by default
        REFinfo.netsum = 0;
        REFinfo.refslug = pack_refslug("SELF-REFERENCE".as_bytes().to_vec());
        REF::pack(REFinfo, &mut pdaREF.try_borrow_mut_data()?)?;

        Ok(())
    }
}
