/****************************************************************
 * Fracpay server instruction enum
 * blairmunroakusa@.0322.anch.AK
 ****************************************************************/

pub enum FracpayInstruction {

    // instruction to create operator main account
    InitMAIN {
        
        bumpMAIN: u8,
        seedMAIN: Vec<u8>,
        bumpPIECE: u8,
        seedPIECE: Vec<u8>,
        bumpREF: u8,
        seedREF: Vec<u8>,
    },
 
    // instruction to create piece main account
    InitPIECE {

        bumpPIECE: u8,
        seedPIECE: Vec<u8>,
        bumpREF: u8,
        seedREF: Vec<u8>,
        PIECEslug: Vec<u8>,
    },
   
    // instruction to create piece ref account
    InitREF {

        bumpREF: u8,
        seedREF: Vec<u8>,
        REFslug: Vec<u8>,
    },
}
