/****************************************************************
 * Fracpay server CreatePIECE instruction process  
 * blairmunroakusa@.0322.anch.AK			      
 ****************************************************************/

#![allow(non_snake_case)]
use solana_program::{
        account_info::AccountInfo,
        entrypoint::ProgramResult,
        program::invoke_signed,
        program_error::ProgramError,
        program_pack::Pack,
        pubkey::Pubkey,
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

    pub fn process_create_piece<'a>(
        program_id: &Pubkey,
        accounts: &'a [AccountInfo<'a>],
        bumpPIECE: u8,
        seedPIECE: Vec<u8>,
        bumpREF: u8,
        seedREF: Vec<u8>,
        PIECEslug: Vec<u8>,
    ) -> ProgramResult {

        // get accounts
        let (operator, rent, pda) = get_accounts(accounts)?;

        // check to make sure tx operator is signer
        if !operator.is_signer {
            return Err(ProgramError::MissingRequiredSignature);
        }
        
        // get MAIN info
        let mut MAINinfo = MAIN::unpack_unchecked(&pda.MAIN.try_borrow_data()?)?;

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
        let rentPIECE = rent.minimum_balance(SIZE_PIECE.into());
        let rentREF = rent.minimum_balance(SIZE_REF.into());

        // create pdaPIECE
        invoke_signed(
        &system_instruction::create_account(
            &operator.key,
            &pda.PIECE.key,
            rentPIECE,
            SIZE_PIECE.into(),
            &program_id
        ),
        &[
            operator.clone(),
            pda.PIECE.clone()
        ],
        &[&[&seedPIECE, &[bumpPIECE]]]
        )?;
        msg!("Successfully created pdaPIECE");

        // create pdaREFself
        invoke_signed(
        &system_instruction::create_account(
            &operator.key,
            &pda.REF.key,
            rentREF,
            SIZE_REF.into(),
            program_id
        ),
        &[
            operator.clone(),
            pda.REF.clone()
        ],
        &[&[&seedREF, &[bumpREF]]]
        )?;
        msg!("Successfully created pdaREFself");

        // update PIECE count
        MAINinfo.piececount = MAINinfo.piececount + 1;
        MAIN::pack(MAINinfo, &mut pda.MAIN.try_borrow_mut_data()?)?;

        // get PIECE info
        let mut PIECEinfo = PIECE::unpack_unchecked(&pda.PIECE.try_borrow_data()?)?;

        // set flags
        let mut FLAGS = BitVec::from_elem(16, false);
        FLAGS.set(0, false); // PIECE account is 0011
        FLAGS.set(1, false);
        FLAGS.set(2, true);
        FLAGS.set(3, true);

        // initialize PIECE account data
        PIECEinfo.flags = pack_flags(FLAGS);
        PIECEinfo.operator = *operator.key;
        PIECEinfo.balance = 0;
        PIECEinfo.netsum = 0;
        PIECEinfo.pieceslug = pack_pieceslug(PIECEslug);
        PIECE::pack(PIECEinfo, &mut pda.PIECE.try_borrow_mut_data()?)?;

        // get REF info
        let mut REFinfo = REF::unpack_unchecked(&pda.REF.try_borrow_data()?)?;

        // set flags
        let mut FLAGS = BitVec::from_elem(16, false);
        FLAGS.set(0, false); // REF self account is 0010
        FLAGS.set(1, false);
        FLAGS.set(2, true);
        FLAGS.set(3, false); 

        // initialize self REF account data
        REFinfo.flags = pack_flags(FLAGS);
        REFinfo.target = *operator.key;
        REFinfo.fract = 100_000_000;    // new self-ref gets 100% by default
        REFinfo.netsum = 0;
        REFinfo.refslug = pack_refslug("SELF-REFERENCE".as_bytes().to_vec());
        REF::pack(REFinfo, &mut pda.REF.try_borrow_mut_data()?)?;

        Ok(())
    }
}
