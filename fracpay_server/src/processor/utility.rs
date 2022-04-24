/****************************************************************
 * Fracpay server utility blob 
 * blairmunroakusa@.0322.anch.AK
 ****************************************************************/

#![allow(non_snake_case)]
#![allow(non_camel_case_types)]
use bit_vec::BitVec;
use std::array::TryFromSliceError;
use crate::state::constants::*;

pub fn check_seed(seed: &Vec<u8>) -> u16 {

    let numbertag = &seed[(PUBKEY_LEN - COUNT_LEN)..];
    let number = ((numbertag[0] as u16) << 8) | numbertag[1] as u16; 

    return number
}

pub fn pack_flags(flags: BitVec) -> u16 {

    let flagbytes = BitVec::to_bytes(&flags);
    let bigflag = ((flagbytes[0] as u16) << 8) | flagbytes[1] as u16;

    return bigflag
}

pub fn unpack_flags(flags: u16) -> BitVec {

    let highflag: u8 = (flags >> 8) as u8;
    let lowflag: u8 = (flags & 0xff) as u8;
    let flagbits = BitVec::from_bytes(&[highflag, lowflag]);

    return flagbits
}

pub fn pack_refslug(REFslug: Vec<u8>) -> [u8; REFSLUG_LEN] {

    let mut REFslug_bytes: Vec<u8>;
    REFslug_bytes = REFslug.to_vec();
    let mut zeros: Vec<u8> = vec![0; REFSLUG_LEN - REFslug_bytes.len()];
    REFslug_bytes.append(&mut zeros);

    return refpack(REFslug_bytes).unwrap();
}

pub fn pack_pieceslug(PIECEslug: Vec<u8>) -> [u8; PIECESLUG_LEN] {

    let mut PIECEslug_bytes: Vec<u8>;
    PIECEslug_bytes = PIECEslug.to_vec();
    let mut zeros: Vec<u8> = vec![0; PIECESLUG_LEN - PIECEslug_bytes.len()];
    PIECEslug_bytes.append(&mut zeros);

    return piecepack(PIECEslug_bytes).unwrap()
}

type REFslugOutput = [u8; REFSLUG_LEN];
type PIECEslugOutput = [u8; PIECESLUG_LEN];

fn refpack(vector: Vec<u8>) -> Result<REFslugOutput, TryFromSliceError> {

    vector.as_slice().try_into()
}

fn piecepack(vector: Vec<u8>) -> Result<PIECEslugOutput, TryFromSliceError> {

    vector.as_slice().try_into()
}

