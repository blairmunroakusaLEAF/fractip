/****************************************************************
 * Fracpay server instruction unpack and match  
 * blairmunroakusa@.0322.anch.AK			   
 ****************************************************************/

#![allow(non_snake_case)]

use solana_program::{
        msg,
        program_error::ProgramError,
    };

use crate::{
        error::FracpayError::InvalidInstruction,
        instruction::data::FracpayInstruction,
        state::constants::PUBKEY_LEN,
    };

impl FracpayInstruction {

    // Unpacks a byte buffer into a FracpayInstruction
    pub fn unpack(input: &[u8]) -> Result<Self, ProgramError> {

        let (tag, rest) = input.split_first().ok_or(InvalidInstruction)?;
        msg!("{:?}", rest);

        Ok( match tag {
            0 => Self::CreateMAIN {
                bumpMAIN: rest[0],
                seedMAIN: rest[(3 + 2*PUBKEY_LEN)..].to_vec(),
                bumpPIECE: rest[1],
                seedPIECE: rest[(3 + PUBKEY_LEN)..(3 + 2*PUBKEY_LEN)].to_vec(),
                bumpREF: rest[2],
                seedREF: rest[3..(3 + PUBKEY_LEN)].to_vec(),
            },
            1 => Self::CreatePIECE {
                bumpPIECE: rest[0],
                seedPIECE: rest[(2 + PUBKEY_LEN)..(2 + 2*PUBKEY_LEN)].to_vec(),
                bumpREF: rest[1],
                seedREF: rest[2..(2 + PUBKEY_LEN)].to_vec(),
                PIECEslug: rest[(2 + 2*PUBKEY_LEN)..].to_vec(),
            },
            2 => Self::CreateREF {
                bumpREF: rest[0],
                seedREF: rest[1..(1 + PUBKEY_LEN)].to_vec(),
                REFslug: rest[(1 + PUBKEY_LEN)..].to_vec(),
            },
            _ => return Err(InvalidInstruction.into()),
        })
    }
}


