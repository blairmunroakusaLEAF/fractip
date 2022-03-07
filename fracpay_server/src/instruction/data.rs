/****************************************************************
 * Fracpay server instruction enum                     			*
 * blairmunroakusa@.0322.anch.AK			                	*
 ****************************************************************/

#![allow(non_snake_case)]

pub enum FracpayInstruction {

    // instruction to create operator main account
    CreateMAIN {

        bumpMAIN: u8,
        seedMAIN: Vec<u8>,
        bumpPIECE: u8,
        seedPIECE: Vec<u8>,
        bumpREF: u8,
        seedREF: Vec<u8>,
    },

    // instruction to create piece main account
    CreatePIECE {

        bumpPIECE: u8,
        seedPIECE: Vec<u8>,
        bumpREF: u8,
        seedREF: Vec<u8>,
        PIECEslug: Vec<u8>,
    },

    // instruction to create piece ref account
    CreateREF {

        bumpREF: u8,
        seedREF: Vec<u8>,
        REFslug: Vec<u8>,
    },
}


