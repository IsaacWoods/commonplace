mod flags;

use anyhow::Result;
use std::{
    env,
    path::{Path, PathBuf},
};
use xshell::{cmd, pushd};

fn main() -> Result<()> {
    let _root = pushd(project_root())?;

    let flags = flags::Task::from_env()?;
    match flags.subcommand {
        flags::TaskCmd::Help(_) => {
            println!("{}", flags::Task::HELP);
            Ok(())
        }

        flags::TaskCmd::Dist(_) => {
            webpack_app()?;
            Ok(())
        }
    }
}

fn webpack_app() -> Result<()> {
    let _app = pushd("app")?;
    cmd!("yarn webpack").run()?;
    Ok(())
}

fn project_root() -> PathBuf {
    Path::new(&env::var("CARGO_MANIFEST_DIR").unwrap_or_else(|_| env!("CARGO_MANIFEST_DIR").to_owned()))
        .ancestors()
        .nth(1)
        .unwrap()
        .to_path_buf()
}
