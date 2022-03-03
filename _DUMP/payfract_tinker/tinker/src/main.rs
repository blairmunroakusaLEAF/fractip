use solana_program::pubkey::Pubkey;
use bit_vec::BitVec;
use std::u32;
use arrayref::{array_mut_ref, array_ref, array_refs, mut_array_refs};
use std::str::FromStr;
use std::array::TryFromSliceError;
use std::convert::TryInto;


    
pub struct PIECE<'a> {
    flags: u16,
    pieceslug: &'a str,
}

impl PIECE<'_> { 
    const LEN: usize = 69;

    pub fn pack_into_slice(&self, dst: &mut [u8]) {
        let dst = array_mut_ref![dst, 0, PIECE::LEN];
        let (
            flags_dst,
            pieceslug_dst,
        ) = mut_array_refs![dst, 2, 67];

        let PIECE {
            flags,
            pieceslug,
        } = self;

        // this is confusing as fuck
        // cant I just do self.flags.to_le_bytes() for eg?
        *flags_dst = flags.to_le_bytes();

        let mut pieceslug_bytes: Vec<u8>;
        pieceslug_bytes = pieceslug.as_bytes().to_vec();
        let mut zeros: Vec<u8> = vec![0; PIECE::LEN - 2 - pieceslug_bytes.len()];

        type VecInput = Vec<u8>;
        type PieceslugOutput = [u8; 67];
        fn package_slug(vector: VecInput) -> Result<PieceslugOutput, TryFromSliceError> {
            vector.as_slice().try_into()
        }
        


        pieceslug_bytes.append(&mut zeros);
        *pieceslug_dst = package_slug(pieceslug_bytes).unwrap();

          }
}
fn main() {

let mut dummy: [u8; 69] = [0; 69];


let s: &mut str = &mut String::from("Like this, you see?");
let mut test = PIECE {
    flags: 256,
    pieceslug: "1122",
};
let mut working = test.pieceslug.as_bytes().to_vec();




let mut zeros: Vec<u8> = vec![0; 67 - working.len()];
working.append(&mut zeros); // finish building up cellvec_t0



test.pack_into_slice(&mut dummy);

println!("{:?}", dummy);

}




