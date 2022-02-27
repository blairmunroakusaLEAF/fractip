use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint::ProgramResult,
    msg,
    program::{invoke, invoke_signed},
    program_error::ProgramError,
    program_pack::{IsInitialized, Pack},
    pubkey::Pubkey,
    sysvar::{rent::Rent, Sysvar},
};
use bit_vec::BitVec;

use crate::{error::PayfractError, instruction::PayfractInstruction, state::{MAIN, PIECE, REF};

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
                sizeMAIN,
                bumpMAIN,
                sizePIECE,
                bumpPIECE,
                sizeREF,
                bumpREF,
                operatorID,
            } => {
                msg!("Instruction: InitMAIN");
                Self::process_init_main(
                    program_id,
                    accounts,
                    sizeMAIN,
                    bumpMAIN,
                    sizePIECE,
                    bumpPIECE,
                    sizeREF,
                    bumpREF,
                    operatorID);
            }
/*
            PayfractInstruction::CreatePieceMain {
                fingerprint,
                piece_id,
            } => {
                msg!("Instruction: CreatePieceMain");
                Self::process_create_piece_main(program_id, accounts, fingerprint, piece_id)
            }

            PayfractInstruction::CreatePieceRef {
                target,
                fract,
                disco,
            } => {
                msg!("Processing 'CreatePieceRef' instruction...");
                Self::process_create_piece_ref(program_id, accounts, target, fract, disco)
            }*/
        }
    }

    fn process_init_main(
        program_id: &Pubkey,
        accounts: &[AccountInfo],
        sizeMAIN: u8
        bumpMAIN: u8,
        sizePIECE: u8,
        bumpPIECE: u8,
        sizeREF: u8,
        bumpREF: u8,
        operatorID: &str,
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
        let rentMAIN = rent.minimum_balance(sizeMAIN.into());
        
        // prep to create self PIECE pda
        let rentPIECE = rent.minimum_balance(sizePIECE.into());

        // prep to create self REF pda
        let rentREF = rent.minimum_balance(sizeREF.into());

        // create pdaMAIN
        invoke_signed(
        &system_instruction::create_account(
            &operator.key,
            &pdaMAIN.key,
            rentMAIN,
            sizeMAIN.into(),
            program_id
        ),
        &[
            operator.clone(),
            pdaMAIN.clone()
        ],
        &[&[&operator.key.as_ref(), &[bumpMAIN]]]
        )?;

        // create pdaPIECEself
        invoke_signed(
        &system_instruction::create_account(
            &operator.key,
            &pdaPIECE.key,
            rentPIECE,
            sizePIECE.into(),
            program_id
        ),
        &[
            operator.clone(),
            pdaPIECE.clone()
        ],
        &[&[&operator.key.as_ref(), &[bumpPIECE]]]
        )?;

        // create pdaREFself
        invoke_signed(
        &system_instruction::create_account(
            &operator.key,
            &pdaREF.key,
            rentREF,
            sizeREF.into(),
            program_id
        ),
        &[
            operator.clone(),
            pdaREF.clone()
        ],
        &[&[&operator.key.as_ref(), &[bumpREF]]]
        )?;

        // initiate MAIN account data

        let mut MAINinfo = MAIN::unpack_unchecked(&pdaMAIN.try_borrow_data()?)?; // don't understand try_borrow_data()..cant find

        let mut FLAGS = BitVec::from_elem(16, false);
        FLAGS.set(0, true); // MAIN account is 11
        FLAGS.set(1, true);
        FLAGS.set(2, true); // third bit == is initialized

        MAINinfo.flags = pack_flags(FLAGS);
        MAINinfo.operator = operator.key;
        MAINinfo.balance = 0;
        MAINinfo.netsum = 0;
        MAINinfo.piececount = 0;

        MAIN::pack(MAINinfo, &mut pdaMAIN.try_borrow_mut_data()?)?;


        // initiate PIECE account data
        
        let operatorID = instruction_data[5..];

        let mut PIECEinfo = PIECE::unpack_unchecked(&pdaPIECE.try_borrow_data()?)?; // don't understand try_borrow_data()

        let mut FLAGS = BitVec::from_elem(16, false);
        FLAGS.set(0, true); // PIECE self account is 10
        FLAGS.set(1, false);
        FLAGS.set(2, true); // is initialized, true

        PIECEinfo.flags = pack_flags(FLAGS);
        PIECEinfo.operator = *operator.key;
        PIECEinfo.balance = 0;
        PIECEinfo.netsum = 0;
        PIECEinfo.refcount = 0;
        PIECEinfo.pieceslug = *operatorID;

        PIECE::pack(PIECEinfo, &mut pdaPIECE.try_borrow_mut_data()?)?;

        // initiate REF account data

        let mut REFinfo = REF::unpack_unchecked(&pdaREF.try_borrow_data()?)?; // don't understand try_borrow_data()

        let mut FLAGS = BitVec::from_elem(16, false);
        FLAGS.set(0, false); // REF self account is 01
        FLAGS.set(1, true);
        FLAGS.set(2, true); // is initialized, true

        REFinfo.flags = pack_flags(FLAGS);
        REFinfo.target = *operator.key;
        REFinfo.fract = 100_000;
        REFinfo.netsum = 0;
        REFinfo.pieceslug = "SELF_REFERENCE";

        REF::pack(REFinfo, &mut pdaREF.try_borrow_mut_data()?)?;


        




        Ok(())
    }


    pub fn pack_flags(flags: BitVec) -> u16 {

        let mut flagbytes = BitVec::to_bytes(&flags);
        let bigflag = ((flagbytes[0] as u16) << 8) | flagbytes[1] as u16;
        return bigflag
    }

    pub fn unpack_flags(flags: u16) -> BitVec {

        let highflag: u8 = (flags >> 8) as u8;
        let lowflag: u8 = (flags & 0xff) as u8;
        let flagbits = BitVec::from_bytes(&[highflag, lowflag]);
        return flagbits
    }
}
