#![allow(non_snake_case)]

use solana_program::{
        msg,
        program_error::ProgramError,
    };

use crate::error::FracpayError::InvalidInstruction;

pub enum FracpayInstruction {

    // instruction to create operator main account
    InitMAIN {
        
        bumpMAIN: u8,
        seedMAIN: Vec<u8>,
        bumpPIECE: u8,
        seedPIECE: Vec<u8>,
        bumpREF: u8,
        seedREF: Vec<u8>,
    },
 
    // instruction to create piece main account
    InitPIECE {

        bumpPIECE: u8,
        seedPIECE: Vec<u8>,
        bumpREF: u8,
        seedREF: Vec<u8>,
        PIECEslug: Vec<u8>,
    },
   
    // instruction to create piece ref account
    InitREF {

        bumpREF: u8,
        seedREF: Vec<u8>,
        REFslug: Vec<u8>,
    },
/*
    // instruction to create piece ref account
    PropagateContribution {

        target: Pubkey,
        fract: u32,     // 
        disco: u8,      // least sig bit high == disconnected ref (disco=1)
    }*/
}


impl FracpayInstruction {

    // Unpacks a byte buffer into a FracpayInstruction
    pub fn unpack(input: &[u8]) -> Result<Self, ProgramError> {

        let (tag, rest) = input.split_first().ok_or(InvalidInstruction)?;
        msg!("{:?}", rest);

        Ok( match tag {
            0 => Self::InitMAIN {
                bumpMAIN: rest[0],
                seedMAIN: rest[67..].to_vec(),
                bumpPIECE: rest[1],
                seedPIECE: rest[35..67].to_vec(),
                bumpREF: rest[2],
                seedREF: rest[3..35].to_vec(),
            },
            1 => Self::InitPIECE {
                bumpPIECE: rest[0],
                seedPIECE: rest[34..66].to_vec(),
                bumpREF: rest[1],
                seedREF: rest[2..34].to_vec(),
                PIECEslug: rest[66..].to_vec(),
            },
            2 => Self::InitREF {
                bumpREF: rest[0],
                seedREF: rest[1..33].to_vec(),
                REFslug: rest[33..].to_vec(),
            },
            /*
            3 => Self::PropagateContribution {
                target: Self::extract_target(rest)?,
                fract: Self::extract_fract(rest)?,
                disco: Self::extract_disco(rest)?,
            },*/
            _ => return Err(InvalidInstruction.into()),
        })
    }
}

////////////////////////////////


    // probably garbage below
/*
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
    }*/
