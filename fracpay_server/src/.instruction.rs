#![allow(non_snake_case)]

use solana_program::{
        msg,
        program_error::ProgramError,
    };

use crate::error::FracpayError::InvalidInstruction;
use Self::enum;
//


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
            _ => return Err(InvalidInstruction.into()),
        })
    }
}


