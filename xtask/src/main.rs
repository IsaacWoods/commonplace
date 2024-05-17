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
        flags::TaskCmd::Dist(dist) => {
            webpack_app(dist.prod)?;
            Ok(())
        }
    }
}

fn webpack_app(prod: bool) -> Result<()> {
    let _app = pushd("app")?;

    if prod {
        cmd!("npx webpack --config webpack.production.js").run()?;
    } else {
        cmd!("npx webpack --config webpack.dev.js").run()?;
    }

    Ok(())
}

fn project_root() -> PathBuf {
    Path::new(&env::var("CARGO_MANIFEST_DIR").unwrap_or_else(|_| env!("CARGO_MANIFEST_DIR").to_owned()))
        .ancestors()
        .nth(1)
        .unwrap()
        .to_path_buf()
}
