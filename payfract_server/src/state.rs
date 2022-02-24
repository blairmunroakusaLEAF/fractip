use borsh::{
        BorshSerialize,
        BorshDeserialize,
    };

// TODO, determine if I need the derive before each struct
// TODO, figure out if the types should be references (unlike paulxs imp)
// TODO, create embedded struct, AccountMeta?
#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct OperatorMainAccount {
    discriminator:  [u8; 8],
    flags: u8,
    version: u8,
    piececount: u16,
}

#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct OperatorSelfAccount {
    discriminator: [u8; 8],
    flags: u8,
    version: u8,
    refcount: u16,
    operatorid: String,
    net: u64,
}

#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct PieceMainAccount {
    discriminator: [u8; 8],
    flags: u8,
    version: u8,
    refcount: u16,
    pieceid: String,
    net: u64,
}

#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct PieceSelfAccount {
    discriminator: [u8; 8],
    flags: u8,
    version: u8,
    net: u64,
}

#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct PieceRefAccount {
    discriminator: [u8; 8],
    flags: u8,
    version: u8,
    fract: u32,
    net: u64,
