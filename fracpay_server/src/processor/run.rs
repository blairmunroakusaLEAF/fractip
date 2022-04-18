/****************************************************************
 * Fracpay server process run      
 * blairmunroakusa@.0322.anch.AK
 ****************************************************************/

#![allow(non_snake_case)]
use solana_program::{
        entrypoint::ProgramResult,
        pubkey::Pubkey,
        account_info::{
            AccountInfo
        },
        msg,
    };
use crate::instruction::data::*;

pub struct Processor;

impl Processor {

    pub fn run_process<'a>(
        program_id: &Pubkey,
        accounts: &'a [AccountInfo<'a>],
        instruction_data: &[u8],
    ) -> ProgramResult {

        let instruction = FracpayInstruction::unpack(instruction_data)?;

        match instruction {

            FracpayInstruction::CreateMAIN {
                bumpMAIN,
                seedMAIN,
                bumpPIECE,
                seedPIECE,
                bumpREF,
                seedREF,
            } => {
                msg!("Instruction: CreateMAIN");
                Self::process_create_main(
                    program_id,
                    accounts,
                    bumpMAIN,
                    seedMAIN,
                    bumpPIECE,
                    seedPIECE,
                    bumpREF,
                    seedREF,
                )
            },
            FracpayInstruction::CreatePIECE {
                bumpPIECE,
                seedPIECE,
                bumpREF,
                seedREF,
                PIECEslug,
            } => {
                msg!("Instruction: CreatePIECE");
                Self::process_create_piece(
                    program_id,
                    accounts,
                    bumpPIECE,
                    seedPIECE,
                    bumpREF,
                    seedREF,
                    PIECEslug,
                )
            },
            FracpayInstruction::CreateREF {
                bumpREF,
                seedREF,
                REFslug,
            } => {
                msg!("Instruction: CreateREF");
                Self::process_create_ref(
                    program_id,
                    accounts,
                    bumpREF,
                    seedREF,
                    REFslug,
                )
            },
            FracpayInstruction::InitPIECE {
                invite,
            } => {
                msg!("Instruction: InitPIECE");
                Self::process_init_piece(
                    program_id,
                    accounts,
                    invite,
                )
            },
             FracpayInstruction::InitREF {
                invite,
                selfseed,
                fract,
            } => {
                msg!("Instruction: InitREF");
                Self::process_init_ref(
                    program_id,
                    accounts,
                    invite,
                    selfseed,
                    fract,
                )
            },
             FracpayInstruction::FracpayPIECE {
                seedREF,
            } => {
                msg!("Instruction: FracpayPIECE");
                Self::process_fracpay_piece(
                    program_id,
                    accounts,
                    seedREF,
                )
            },
        }
    }
}
