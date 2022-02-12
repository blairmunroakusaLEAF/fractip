// use external crates
use std::convert::TryInto;
use solana_program::{
        program_error::ProgramError,
        pubkey::Pubkey,
    };

// use internal crates
use crate::error::PayfractError::InvalidInstruction;

pub enum PayfractInstruction {

    // put documentation here
    
    CreateOperatorMain {

        operator_pubkey: Pubkey,
    }
