# co-physist

AI co-Physicist: run powerful physics tools to drive cutting edge research

<img width="1397" height="790" alt="image" src="https://github.com/user-attachments/assets/ff8d5a28-d214-44b0-8fb3-f99f82de364a" />

## How it works

It is a command line tool (like Claude Code:)

It runs LLMs in a loop (ie it's a set of agents)

## Demo

<img width="1024" height="576" alt="image" src="https://github.com/user-attachments/assets/01b2bce7-2512-467a-8871-f0fee82d2cf5" />

To demonstrate we give it a goal

```
Figure out how to propulsively land on Mars
```

### Why?

This is a very hard problem as it involves real-time simulation of turbulent flow, this is an area of active scientific research by NASA, SpaceX and others.

### What we expect?

Agent should be able to do:
- deep literature review (currently `using o3-deep-research`)
- download and setup physics simulation environment using state of the art tools (eg FEniCS/DolphinX for finite-element simulations)
- implement several state of the art algorithms (using o3-pro)
- run experiments trying see how good its new algorithms are vs state of the art (using VM running on Modal)
- produce report (using GPT-5)
- make a nice popularizing video (using Veo3)

### How we made it?

Asked Claude Code to do all of this, just kidding, or not kidding :)

### Results

After 3h of agent working and burning lots of credits:
- it figured algorithm to work on
- created a simpler simulation to do
- found experimental results to try to match (real experiments by NASA, not computer simulation)
- created readable report
- created a video
