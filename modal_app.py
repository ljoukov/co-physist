# Modal app for running the Poisson solver
import modal

app = modal.App("co-physist-poisson")

# Build an environment with conda-forge scientific stack via micromamba
image = (
    modal.Image.micromamba()
    .micromamba_install(
        [
            "python=3.11",
            "fenics-dolfinx",
            "petsc",
            "petsc4py",
            "slepc",
            "slepc4py",
            "mpi4py",
            "gmsh",
        ]
    )
    .pip_install(
        [
            "jax[cpu]",
            "flax",
            "optax",
            "scikit-learn",
            "numpy",
            "tqdm",
        ]
    )
)

# Mount the repository so we can import the script directly
repo_mount = modal.Mount.from_local_dir(
    ".",
    remote_path="/root/app",
    recursive=True,
)


@app.function(image=image, mounts=[repo_mount], timeout=60 * 60)
def run(num_samples: int = 50, points: int = 512, epochs: int = 200):
    import sys

    # Ensure mounted repo is importable
    sys.path.insert(0, "/root/app")

    # Import and invoke your script's main without modifying it
    from output.toy_gaot_poisson import main

    argv = [
        "--num-samples",
        str(num_samples),
        "--points",
        str(points),
        "--epochs",
        str(epochs),
    ]
    main(argv)


# Local entrypoint so you can trigger remote execution via CLI
@app.local_entrypoint()
def launch(num_samples: int = 50, points: int = 512, epochs: int = 200):
    run.remote(num_samples=num_samples, points=points, epochs=epochs)
