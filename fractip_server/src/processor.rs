#![allow(non_snake_case)]

use solana_program::{
        msg,
        system_instruction,
        entrypoint::ProgramResult,
        program::invoke_signed,
        program::invoke_signed_unchecked,
        program_error::ProgramError,
        program_pack::Pack,
        pubkey::Pubkey,
        account_info::{
            next_account_info,
            AccountInfo
        },
        sysvar::{
            rent::Rent,
            Sysvar
        },
    };
use bit_vec::BitVec;
use std::array::TryFromSliceError;

use crate::{
        instruction::PayfractInstruction,
        state::{
            MAIN,
            SIZE_MAIN,
            PIECE,
            SIZE_PIECE,
            REF,
            SIZE_REF,
        },
    };

const PIECESLUG_LEN: usize = 67;
const REFSLUG_LEN: usize = 20;


pub struct Processor;

impl Processor {

    pub fn process(
        program_id: &Pubkey,
        accounts: &[AccountInfo],
        instruction_data: &[u8],
    ) -> ProgramResult {

        let instruction = PayfractInstruction::unpack(instruction_data)?;

        match instruction {

            PayfractInstruction::InitMAIN {
                bumpMAIN,
                seedMAIN,
                bumpPIECE,
                seedPIECE,
                bumpREF,
                seedREF,
            } => {
                msg!("Instruction: InitMAIN");
                Self::process_init_main(
                    program_id,
                    accounts,
                    bumpMAIN,
                    seedMAIN,
                    bumpPIECE,
                    seedPIECE,
                    bumpREF,
                    seedREF,
                )
            }
        }
    }

    fn process_init_main(
        program_id: &Pubkey,
        accounts: &[AccountInfo],
        bumpMAIN: u8,
        seedMAIN: Vec<u8>,
        bumpPIECE: u8,
        seedPIECE: Vec<u8>,
        bumpREF: u8,
        seedREF: Vec<u8>,
    ) -> ProgramResult {

        let account_info_iter = &mut accounts.iter();
        
        // account #1
        let operator = next_account_info(account_info_iter)?;

        if !operator.is_signer {
            return Err(ProgramError::MissingRequiredSignature);
        }
        
        // account #2
        let rent = &Rent::from_account_info(next_account_info(account_info_iter)?)?;

        // account #3
        let pdaMAIN = next_account_info(account_info_iter)?;
        
        // account #4
        let pdaPIECE = next_account_info(account_info_iter)?;

        // account #5
        let pdaREF = next_account_info(account_info_iter)?;

        // prep to create MAIN pda
        let rentMAIN = rent.minimum_balance(SIZE_MAIN.into());
        
        // prep to create self PIECE pda
        let rentPIECE = rent.minimum_balance(SIZE_PIECE.into());

        // prep to create self REF pda
        let rentREF = rent.minimum_balance(SIZE_REF.into());

       
        // create pdaMAIN
        invoke_signed_unchecked(
        &system_instruction::create_account(
            &operator.key,
            &pdaMAIN.key,
            rentMAIN,
            SIZE_MAIN.into(),
            &program_id
        ),
        &[
            operator.clone(),
            pdaMAIN.clone()
        ],
        &[&[&seedMAIN, &[bumpMAIN]]]
        )?;
        msg!("Successfully created pdaMAIN");

        // create pdaPIECEself
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
        msg!("Successfully created pdaREF");


        // initialize MAIN account data

        let mut MAINinfo = MAIN::unpack_unchecked(&pdaMAIN.try_borrow_data()?)?;

        let mut FLAGS = BitVec::from_elem(16, false);
        FLAGS.set(0, true); // MAIN account is 11
        FLAGS.set(1, true);
        FLAGS.set(2, true); // third bit == is initialized

        MAINinfo.flags = pack_flags(FLAGS);
        MAINinfo.operator = *operator.key;
        MAINinfo.balance = 0;
        MAINinfo.netsum = 0;
        MAINinfo.piececount = 0;

        MAIN::pack(MAINinfo, &mut pdaMAIN.try_borrow_mut_data()?)?;


        // initialize PIECE account data
        
        let mut PIECEinfo = PIECE::unpack_unchecked(&pdaPIECE.try_borrow_data()?)?;

        let mut FLAGS = BitVec::from_elem(16, false);
        FLAGS.set(0, true); // PIECE self account is 10
        FLAGS.set(1, false);
        FLAGS.set(2, true); // is initialized, true

        PIECEinfo.flags = pack_flags(FLAGS);
        PIECEinfo.operator = *operator.key;
        PIECEinfo.balance = 0;
        PIECEinfo.netsum = 0;
        PIECEinfo.refcount = 0;
        { 
            type VecInput = Vec<u8>;
            type PieceslugOutput = [u8; PIECESLUG_LEN];
            fn package_slug(vector: VecInput) -> Result<PieceslugOutput, TryFromSliceError> {
                vector.as_slice().try_into()
            }
            let mut pieceslug_bytes: Vec<u8>;
            pieceslug_bytes = seedMAIN.to_vec();
            let mut zeros: Vec<u8> = vec![0; PIECESLUG_LEN - pieceslug_bytes.len()];
            pieceslug_bytes.append(&mut zeros);
            PIECEinfo.pieceslug = package_slug(pieceslug_bytes).unwrap();
        }

        PIECE::pack(PIECEinfo, &mut pdaPIECE.try_borrow_mut_data()?)?;


        // initialize REF account data

        let mut REFinfo = REF::unpack_unchecked(&pdaREF.try_borrow_data()?)?;

        let mut FLAGS = BitVec::from_elem(16, false);
        FLAGS.set(0, false); // REF self account is 01
        FLAGS.set(1, true);
        FLAGS.set(2, true); // is initialized, true

        REFinfo.flags = pack_flags(FLAGS);
        REFinfo.target = *operator.key;
        REFinfo.fract = 100_000;
        REFinfo.netsum = 0;
        {
            let slug = "SELF_REFERENCE";
            type VecInput = Vec<u8>;
            type RefslugOutput = [u8; REFSLUG_LEN];
            let mut refslug_bytes: Vec<u8>;
            fn package_slug(vector: VecInput) -> Result<RefslugOutput, TryFromSliceError> {
                vector.as_slice().try_into()
            }
            refslug_bytes = slug.as_bytes().to_vec();
            let mut zeros: Vec<u8> = vec![0; REFSLUG_LEN - refslug_bytes.len()];
            refslug_bytes.append(&mut zeros);
            REFinfo.refslug = package_slug(refslug_bytes).unwrap();
        }

        REF::pack(REFinfo, &mut pdaREF.try_borrow_mut_data()?)?;


        Ok(())
    }
}

    pub fn pack_flags(flags: BitVec) -> u16 {

        let flagbytes = BitVec::to_bytes(&flags);
        let bigflag = ((flagbytes[0] as u16) << 8) | flagbytes[1] as u16;
        return bigflag
    }

    pub fn unpack_flags(flags: u16) -> BitVec {

        let highflag: u8 = (flags >> 8) as u8;
        let lowflag: u8 = (flags & 0xff) as u8;
        let flagbits = BitVec::from_bytes(&[highflag, lowflag]);
        return flagbits
    }

