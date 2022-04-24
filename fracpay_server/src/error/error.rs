/****************************************************************
 * Fracpay server error handling
 * blairmunroakusa@.0322.anch.AK
 ****************************************************************/

use solana_program::{
        program_error::ProgramError,
        msg,
    };
use thiserror::Error;

#[derive(Error, Debug, Copy, Clone)]
pub enum FracpayError {

    // These errors are so egregious that
    // they should interrupt client

    /// Invalid instruction
    #[error("Invalid Instruction")]
    InvalidInstruction,

    /// Not Rent Exempt
    #[error("Not Rent Exempt")]
    NotRentExempt,

    /// Amount Overflow
    #[error("Amount Overflow")]
    AmountOverflow,

    /// Try From Slice
    #[error("Try From Slice Error")]
    TryFromSliceError,

    /// Account Creation Attempt Fail
    #[error("Account Creation Attempt Error")]
    AccountCreationAttemptError,

    /// Fatal Flipflop mismatch
    #[error("Fatal Flipflop Mismatch")]
    FlipflopMismatchError,

    /// REF does not belong to PIECE
    #[error("REF Isn't Owned By PIECE")]
    REFNotOwnedError,

    /// Target passed mismatches state
    #[error("Target is not correct.")]
    TargetMismatchError,

}

impl From<FracpayError> for ProgramError {
    fn from(error: FracpayError) -> Self {
        msg!("{:?}", error);
        ProgramError::Custom(error as u32)
    }
}
