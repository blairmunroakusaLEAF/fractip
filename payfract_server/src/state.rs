use solana_program::pubkey::Pubkey;
use borsh::{
        BorshSerialize,
        BorshDeserialize,
    };

// TODO, determine if I need the derive before each struct
// TODO, figure out if the types should be references (unlike paulxs imp)
// TODO, create embedded struct, AccountMeta?
#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct Main {
    operator: Pubkey,
    flags: u8,
    piececount: u32,
    balance: u64,
    netsum: u64,
}

pub struct Piece {
    operator: Pubkey,
    flags: u8,
    refcount: u32,
    balance: u64,
    netsum: u64,
    pieceslug: String,
}

#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct Ref {
    target: Pubkey,
    flags: u8,
    fract: u32,
    netsum: u64,
    refslug: String,
}

