/****************************************************************
 * Fracpay server utility blob                      			*
 * blairmunroakusa@.0322.anch.AK			                	*
 ****************************************************************/

#![allow(non_snake_case)]

use bit_vec::BitVec;

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
