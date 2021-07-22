use xflags::xflags;

xflags! {
    src "./src/flags.rs"

    cmd task {
        default cmd help {
            optional -h, --help
        }

        cmd dist {
            optional --prod
        }
    }
}

// generated start
// The following code is generated by `xflags` macro.
// Run `env UPDATE_XFLAGS=1 cargo build` to regenerate.
#[derive(Debug)]
pub struct Task {
    pub subcommand: TaskCmd,
}

#[derive(Debug)]
pub enum TaskCmd {
    Help(Help),
    Dist(Dist),
}

#[derive(Debug)]
pub struct Help {
    pub help: bool,
}

#[derive(Debug)]
pub struct Dist {
    pub prod: bool,
}

impl Task {
    pub const HELP: &'static str = Self::HELP_;

    #[allow(dead_code)]
    pub fn from_env() -> xflags::Result<Self> {
        Self::from_env_()
    }

    #[allow(dead_code)]
    pub fn from_vec(args: Vec<std::ffi::OsString>) -> xflags::Result<Self> {
        Self::from_vec_(args)
    }
}
// generated end
