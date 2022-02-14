use borsh::{
        BorshSerialize,
        BorshDeserialize,
    };


// TODO, determine if I need the derive before each struct
// TODO, figure out if the types should be references (unlike paulxs imp)
#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct OperatorMainAccount {
    discriminator: u64,
    piececount: ,
    flags: ,
    version: ,
}

pub struct OperatorSelfAccount {
    discriminator: u64,
    operatorid:
    refcount: ,
    net: ,
    flags: ,
    version: ,
}

pub struct PieceMainAccount {
    discriminator: u64,
    pieceid: ,
    refcount: ,
    net: ,
    flags: ,
    version: ,
}

pub struct PieceSelfAccount {
    discriminator: u64,
    net: ,
    flags: ,
    version: ,
}

pub struct PieceRefAccount {
    discriminator: ,
    target: ,
    fract: ,
    net: ,
    flags: ,
    version: ,
