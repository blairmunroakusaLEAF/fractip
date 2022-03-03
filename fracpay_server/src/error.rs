use thiserror::Error;

use solana_program::program_error::ProgramError;

#[derive(Error, Debug, Copy, Clone)]
pub enum PayfractError {
    /// Invalid instruction
    #[error("Invalid Instruction")]
    InvalidInstruction,
    /// Not Rent Exempt
    #[error("Not Rent Exempt")]
    NotRentExempt,
    /// Expected Amount Mismatch
    #[error("Expected Amount Mismatch")]
    ExpectedAmountMismatch,
    /// Amount Overflow
    #[error("Amount Overflow")]
    AmountOverflow,
    /// Try From Slice
    #[error("Try From Slice Fail")]
    TryFromSliceError,
}

impl From<PayfractError> for ProgramError {
    fn from(error: PayfractError) -> Self {
        ProgramError::Custom(error as u32)
    }
}
