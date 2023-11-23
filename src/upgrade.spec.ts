// SPDX-License-Identifier: Apache-2.0
// SPDX-FileCopyrightText: 2023 Uri Shaked <uri@tinytapeout.com>

import { describe, expect, test } from 'vitest';
import { upgradeProject } from './upgrade.js';

describe('upgradeInfoYaml', () => {
  test('Upgrade verilog project info.yaml from version 4 to 6', () => {
    const inputYaml = `
---
# Tiny Tapeout project information
project:
  wokwi_id:    0        # If using wokwi, set this to your project's ID

# If using an HDL, set wokwi_id as 0 and uncomment and list your source files here.
# Source files must be in ./src and you must list each source file separately
  source_files:
    - cell.v
    - grid_8x32.v
    - max7219.v
    - spi_master.v
    - demo.v
    - silife.v
  top_module:  "tt_um_urish_silife_max"      # Put the name of your top module here, must start with "tt_um_". Make it unique by including your github username

# How many tiles your design occupies? A single tile is about 167x108 uM.
  tiles: "3x2"    # Valid values: 1x1, 1x2, 2x2, 3x2, 4x2 or 8x2

# Keep a track of the submission yaml
yaml_version: 4

# As everyone will have access to all designs, try to make it easy for someone new to your design to know what
# it does and how to operate it. This info will be automatically collected and used to make a datasheet for the chip.
#
# Here is a great example: https://github.com/davidsiaw/tt02-davidsiaw-stackcalc/blob/38c5647f83aad2aec675d566aa3d67b98f0aac81/info.yaml
documentation:
  author:       "Uri Shaked"      # Your name
  title:        "Game of Life 8x32 (siLife)"      # Project title
  language:     "Verilog" # other examples include Verilog, Amaranth, VHDL, etc
  description:  "Silicon implementation of Conway's Game of Life with LED Dot Matrix Output"      # Short description of what your project does

# Longer description of how the project works. You can use standard markdown format.
  how_it_works: |
      It is a silicon implementation of Conway's Game of Life. The game is played on a 8x32 grid, and the rules are as follows:
      - Any live cell with fewer than two live neighbours dies, as if by underpopulation.
      - Any live cell with two or three live neighbours lives on to the next generation.
      - Any live cell with more than three live neighbours dies, as if by overpopulation.
      - Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.

# Instructions on how someone could test your project, include things like what buttons do what and how to set the clock if needed
  how_to_test:  |
      Demo mode:
      The demo mode loads a pre-defined game into the grid and advances it automatically.
      To enter the demo mode, \`wr_en\` high while reseting the design (\`rst_n\` low).
      Use the \`pattern_sel\` inputs to select the desired demo pattern.
      Set \`en\` to 1 to automatically advance one generation every 0.4 seconds (assuming a 10MHz clock).
      To pause the game, set \`en\` to 0.

      Manual mode:
      Load the initial grid row by row.
      Each row is loaded by selecting the row number (using the \`row_sel[4:0]\` inputs),
      setting the \`cell_in[7:0]\` inputs to the desired state, and pulsing the \`wr_en\` input.

      Once the grid is loaded, set the \`en\` input to 1 to start the game.
      The game will advance one step in each clock cycle.
      To pause the game, set the \`en\` input to 0.

      To view the current state of the grid, set the \`row_sel[4:0]\` inputs to the desired row number,
      \`max7219_en\` to 0, and read the \`cell_out[7:0]\` outputs.

      Alternatively, set \`max7129_en\` to 1 to display the grid on a MAX7219 LED Matrix (FC-16 module).

# A description of what the inputs do (e.g. red button, SPI CLK, SPI MOSI, etc).
  inputs:
    - row_sel[0] / pattern_sel
    - row_sel[1]
    - rol_sel[2]
    - rol_sel[3]
    - rol_sel[4]
    - max7129_en
    - en
    - wr_en
# A description of what the outputs do (e.g. status LED, SPI MISO, etc)
  outputs:
    - cell_out[0] / max7129_cs
    - cell_out[1] / max7129_clk
    - cell_out[2] / max7129_din
    - cell_out[3]
    - cell_out[4]
    - cell_out[5]
    - cell_out[6]
    - cell_out[7]
# A description of what the bidirectional I/O pins do (e.g. I2C SDA, I2C SCL, etc)
  bidirectional:
    - cell_in[0]
    - cell_in[1]
    - cell_in[2]
    - cell_in[3]
    - cell_in[4]
    - cell_in[5]
    - cell_in[6]
    - cell_in[7]

# The following fields are optional
  tag:          "display, cell automata, max7219"      # comma separated list of tags: test, encryption, experiment, clock, animation, utility, industrial, pwm, fpga, alu, microprocessor, risc, riscv, sensor, signal generator, fft, filter, music, bcd, sound, serial, timer, random number generator, calculator, decoder, counter, puzzle, multiplier, game, oscillator,
  external_hw:  "MAX7219 LED Matrix (FC-16 module)"      # Describe any external hardware needed
  discord:      "urish"      # Your discord handle, used for communication and automatically assigning tapeout role after a submission
  doc_link:     ""      # URL to longer form documentation, eg the README.md in your repository
  clock_hz:     10000000       # Clock frequency in Hz (if required)
  picture:      "docs/silife-max.jpg"      # relative path to a picture in your repository (must be 512kb or less)
`;

    expect(upgradeProject(inputYaml)).toEqual({
      yaml: `# Tiny Tapeout project information
project:
  title:        "Game of Life 8x32 (siLife)"      # Project title
  author:       "Uri Shaked"      # Your name
  discord:      "urish"      # Your discord username, for communication and automatically assigning you a Tapeout role (optional)
  description:  "Silicon implementation of Conway's Game of Life with LED Dot Matrix Output"      # One line description of what your project does
  language:     "Verilog" # other examples include Verilog, Amaranth, VHDL, etc
  clock_hz:     10000000       # Clock frequency in Hz (or 0 if not applicable)

  # How many tiles your design occupies? A single tile is about 167x108 uM.
  tiles: "3x2"          # Valid values: 1x1, 1x2, 2x2, 3x2, 4x2, 6x2 or 8x2

  # Your top module name must start with "tt_um_". Make it unique by including your github username:
  top_module:  "tt_um_urish_silife_max"

  # List your project's source files here. Source files must be in ./src and you must list each source file separately, one per line:
  source_files:
    - "cell.v"
    - "grid_8x32.v"
    - "max7219.v"
    - "spi_master.v"
    - "demo.v"
    - "silife.v"

# The pinout of your project. Leave unused pins blank. DO NOT delete or add any pins.
pinout:
  # Inputs
  ui[0]: "row_sel[0] / pattern_sel"
  ui[1]: "row_sel[1]"
  ui[2]: "rol_sel[2]"
  ui[3]: "rol_sel[3]"
  ui[4]: "rol_sel[4]"
  ui[5]: "max7129_en"
  ui[6]: "en"
  ui[7]: "wr_en"

  # Outputs
  uo[0]: "cell_out[0] / max7129_cs"
  uo[1]: "cell_out[1] / max7129_clk"
  uo[2]: "cell_out[2] / max7129_din"
  uo[3]: "cell_out[3]"
  uo[4]: "cell_out[4]"
  uo[5]: "cell_out[5]"
  uo[6]: "cell_out[6]"
  uo[7]: "cell_out[7]"

  # Bidirectional pins
  uio[0]: "cell_in[0]"
  uio[1]: "cell_in[1]"
  uio[2]: "cell_in[2]"
  uio[3]: "cell_in[3]"
  uio[4]: "cell_in[4]"
  uio[5]: "cell_in[5]"
  uio[6]: "cell_in[6]"
  uio[7]: "cell_in[7]"

# Do not change!
yaml_version: 6
`,
      markdown: `<!---

This file is used to generate your project datasheet. Please fill in the information below and delete any unused
sections.

You can also include images in this folder and reference them in the markdown. Each image must be less than
512 kb in size, and the combined size of all images must be less than 1 MB.
-->

## How it works

It is a silicon implementation of Conway's Game of Life. The game is played on a 8x32 grid, and the rules are as follows:
- Any live cell with fewer than two live neighbours dies, as if by underpopulation.
- Any live cell with two or three live neighbours lives on to the next generation.
- Any live cell with more than three live neighbours dies, as if by overpopulation.
- Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.

## How to test

Demo mode:
The demo mode loads a pre-defined game into the grid and advances it automatically.
To enter the demo mode, \`wr_en\` high while reseting the design (\`rst_n\` low).
Use the \`pattern_sel\` inputs to select the desired demo pattern.
Set \`en\` to 1 to automatically advance one generation every 0.4 seconds (assuming a 10MHz clock).
To pause the game, set \`en\` to 0.

Manual mode:
Load the initial grid row by row.
Each row is loaded by selecting the row number (using the \`row_sel[4:0]\` inputs),
setting the \`cell_in[7:0]\` inputs to the desired state, and pulsing the \`wr_en\` input.

Once the grid is loaded, set the \`en\` input to 1 to start the game.
The game will advance one step in each clock cycle.
To pause the game, set the \`en\` input to 0.

To view the current state of the grid, set the \`row_sel[4:0]\` inputs to the desired row number,
\`max7219_en\` to 0, and read the \`cell_out[7:0]\` outputs.

Alternatively, set \`max7129_en\` to 1 to display the grid on a MAX7219 LED Matrix (FC-16 module).

## External Hardware

MAX7219 LED Matrix (FC-16 module)
`,
    });
  });

  test('Upgrade Wokwi project info.yaml from version 4 to 6', () => {
    const inputYaml = `
---
# Tiny Tapeout project information
project:
  wokwi_id:    379824923824476161        # If using wokwi, set this to your project's ID

# If using an HDL, set wokwi_id as 0 and uncomment and list your source files here.
# Source files must be in ./src and you must list each source file separately
#  source_files:
#    - counter.v
#    - decoder.v
#  top_module:  "tt_um_example"      # Put the name of your top module here, must start with "tt_um_". Make it unique by including your github username

# How many tiles your design occupies? A single tile is about 167x108 uM.
  tiles: "1x1"    # Valid values: 1x1, 1x2, 2x2, 3x2, 4x2 or 8x2

# Keep a track of the submission yaml
yaml_version: 4

# As everyone will have access to all designs, try to make it easy for someone new to your design to know what
# it does and how to operate it. This info will be automatically collected and used to make a datasheet for the chip.
#
# Here is a great example: https://github.com/davidsiaw/tt02-davidsiaw-stackcalc/blob/38c5647f83aad2aec675d566aa3d67b98f0aac81/info.yaml
documentation:
  author:       "Justin Hui"      # Your name
  title:        "Analog Clock"      # Project title
  language:     "Wokwi" # other examples include Verilog, Amaranth, VHDL, etc
  description:  "LED controller for an Analog Clock taking a 1Hz internal clk input"      # Short description of what your project does

# Longer description of how the project works. You can use standard markdown format.
  how_it_works: |
      increments seconds Counter for 60 sec.
      increments min Counter for 60 min.
      increments hour counter for 12 hours

      all daisy chained.

      The LEDs will show the hour and the last 15min increment

# Instructions on how someone could test your project, include things like what buttons do what and how to set the clock if needed
  how_to_test:  |
      connect leds to each output pin as described below

      RST will set the time to 11:59.

      Input Pins 7/8 are used to set the time, by toggling those it should increment the internal clock by 1 min/hour. You should see the hour output update immediately.
      The min output will only change once the next 15min increment passes

      Input Pin 1 will stop the clock when high

# A description of what the inputs do (e.g. red button, SPI CLK, SPI MOSI, etc).
  inputs:
    - none
    - stop the clock
    - none
    - none
    - none
    - none
    - increment min counter by 1
    - increment hour counter by 1
# A description of what the outputs do (e.g. status LED, SPI MISO, etc)
  outputs:
    - hour 12 led
    - hour 1 led
    - hour 2 led
    - hour 3 led
    - hour 4 led
    - hour 5 led
    - hour 6 led
    - hour 7 led
# A description of what the bidirectional I/O pins do (e.g. I2C SDA, I2C SCL, etc)
  bidirectional:
    - hour 8 led
    - hour 9 led
    - hour 10 led
    - hour 11 led
    - 0 min
    - 15 min
    - 30 min
    - 45 min

# The following fields are optional
  tag:          "clock, timer, decoder, counter"      # comma separated list of tags: test, encryption, experiment, clock, animation, utility, industrial, pwm, fpga, alu, microprocessor, risc, riscv, sensor, signal generator, fft, filter, music, bcd, sound, serial, timer, random number generator, calculator, decoder, counter, puzzle, multiplier, game, oscillator,
  external_hw:  ""      # Describe any external hardware needed
  discord:      ""      # Your discord handle, used for communication and automatically assigning tapeout role after a submission
  doc_link:     ""      # URL to longer form documentation, eg the README.md in your repository
  clock_hz:     1       # Clock frequency in Hz (if required)
  picture:      ""      # relative path to a picture in your repository (must be 512kb or less)
`;

    expect(upgradeProject(inputYaml)).toEqual({
      yaml: `# Tiny Tapeout project information
project:
  wokwi_id:     379824923824476161       # Set this to the ID of your Wokwi project (the number from the project's URL)
  title:        "Analog Clock"      # Project title
  author:       "Justin Hui"      # Your name
  discord:      ""      # Your discord username, for communication and automatically assigning you a Tapeout role (optional)
  description:  "LED controller for an Analog Clock taking a 1Hz internal clk input"      # One line description of what your project does
  language:     "Wokwi" # other examples include Verilog, Amaranth, VHDL, etc
  clock_hz:     1       # Clock frequency in Hz (or 0 if not applicable)

  # How many tiles your design occupies? A single tile is about 167x108 uM.
  tiles: "1x1"          # Valid values: 1x1, 1x2, 2x2, 3x2, 4x2, 6x2 or 8x2

# The pinout of your project. Leave unused pins blank. DO NOT delete or add any pins.
pinout:
  # Inputs
  ui[0]: ""
  ui[1]: "stop the clock"
  ui[2]: ""
  ui[3]: ""
  ui[4]: ""
  ui[5]: ""
  ui[6]: "increment min counter by 1"
  ui[7]: "increment hour counter by 1"

  # Outputs
  uo[0]: "hour 12 led"
  uo[1]: "hour 1 led"
  uo[2]: "hour 2 led"
  uo[3]: "hour 3 led"
  uo[4]: "hour 4 led"
  uo[5]: "hour 5 led"
  uo[6]: "hour 6 led"
  uo[7]: "hour 7 led"

  # Bidirectional pins
  uio[0]: "hour 8 led"
  uio[1]: "hour 9 led"
  uio[2]: "hour 10 led"
  uio[3]: "hour 11 led"
  uio[4]: "0 min"
  uio[5]: "15 min"
  uio[6]: "30 min"
  uio[7]: "45 min"

# Do not change!
yaml_version: 6
`,
      markdown: `<!---

This file is used to generate your project datasheet. Please fill in the information below and delete any unused
sections.

You can also include images in this folder and reference them in the markdown. Each image must be less than
512 kb in size, and the combined size of all images must be less than 1 MB.
-->

## How it works

increments seconds Counter for 60 sec.
increments min Counter for 60 min.
increments hour counter for 12 hours

all daisy chained.

The LEDs will show the hour and the last 15min increment

## How to test

connect leds to each output pin as described below

RST will set the time to 11:59.

Input Pins 7/8 are used to set the time, by toggling those it should increment the internal clock by 1 min/hour. You should see the hour output update immediately.
The min output will only change once the next 15min increment passes

Input Pin 1 will stop the clock when high
`,
    });
  });
});
