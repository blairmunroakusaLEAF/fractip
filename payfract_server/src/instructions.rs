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
    
    // instruction to create operator main account
    CreateOperatorMain {

        fingerprint: Pubkey,  // 32B of encrypted pubkey
        operator_id: String,
    }
    
    // instruction to create piece main account
    CreatePieceMain {

        fingerprint: Pubkey,
        piece_id: String,
    }
    
    // instruction to create piece ref account
    CreatePieceRef {

        target: Pubkey,
        fract: u32,     // 
        disco: u8,      // least sig bit high == disconnected ref (disco=1)
    }
}


impl PayfractInstruction {

    // Unpacks a byte buffer into a PayfractInstruction
    pub fn unpack(input: &[u8]) -> Result<Self, ProgramError> {

        let (tag, rest) = input.split_first().ok_or(InvalidInstruction)?;

        Ok( match tag {
            0 => Self::CreateOperatorMain {
                fingerprint: Self::extract_fingerprint(rest)?,
                operator_id: Self::extract_operator_id(rest)?,
            },
            1 => Self::CreatePieceMain {
                fingerprint: Self::extract_fingerprint(rest)?,
                piece_id: Self::extract_piece_id(rest)?,
            },
            2 => Self::CreatePieceRef {
                target: Self::extract_target(rest)?,
                fract: Self::extract_fract(rest)?,
                disco: Self::extract_disco(rest)?,
            },
            _ => return Err(InvalidInstruction.into()),
        })
    }

    fn extract_fingerprint(input: &[u8]) -> Result<Pubkey, ProgramError> {
        let fingerprint = input
            .get(..32)
            .and_then(|slice| slice.try_into().ok())
            .map(pubkey::deserialize)
            .ok_or(InvalidInstruction)?;
        Ok(fingerprint)
    }

    // TODO, figure out string type deserialization
    fn extract_operator_id(input: &[u8]) -> Result<String, ProgramError> {
        let operator_id = input
            .get(..8)
            .and_then(|slice| slice.try_into().ok())
            .map(u64::from_le_bytes)
            .ok_or(InvalidInstruction)?;
        Ok(operator_id)
    }

    // TODO, figure out string type deserialization
    fn extract_piece_id(input: &[u8]) -> Result<String, ProgramError> {
        let piece_id = input
            .get(..8)
            .and_then(|slice| slice.try_into().ok())
            .map(u64::from_le_bytes)
            .ok_or(InvalidInstruction)?;
        Ok(piece_id)
    }

    fn extract_target(input: &[u8]) -> Result<Pubkey, ProgramError> {
        let target = input
            .get(..32)
            .and_then(|slice| slice.try_into().ok())
            .map(pubkey::deserialize)
            .ok_or(InvalidInstruction)?;
        Ok(target)
    }

    fn extract_fract(input: &[u8]) -> Result<u32, ProgramError> {
        let fract = input
            .get(32..36)
            .and_then(|slice| slice.try_into().ok())
            .map(u32::from_le_bytes)
            .ok_or(InvalidInstruction)?;
        Ok(fract)
    }

    // TODO, figure out how to just grab the byte
    fn extract_disco(input: &[u8]) -> Result<u8, ProgramError> {
        let disco = input
            .get(36)
            .and_then(|slice| slice.try_into().ok())
            .map(u8::from_le_bytes)
            .ok_or(InvalidInstruction)?;
        Ok(disco)
    }
}
