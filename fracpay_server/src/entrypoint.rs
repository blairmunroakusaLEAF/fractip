/****************************************************************
 * Fracpay server entrypoint                         			*
 * blairmunroakusa@.0322.anch.AK			                	*
 ****************************************************************/

use solana_program::{
    entrypoint,
    account_info::AccountInfo,
    entrypoint::ProgramResult,
    pubkey::Pubkey,
};

use crate::processor::run::Processor;

entrypoint!(process_instruction);
fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    Processor::process(program_id, accounts, instruction_data)
}
