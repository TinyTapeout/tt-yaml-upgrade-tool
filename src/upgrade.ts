// SPDX-License-Identifier: Apache-2.0
// SPDX-FileCopyrightText: 2023 Uri Shaked <uri@tinytapeout.com>

import YAML from 'yaml';

export function upgradeProject(infoYaml: string) {
  let yamlObj;
  try {
    yamlObj = YAML.parse(infoYaml, { intAsBigInt: true });
  } catch (e) {
    return {
      error: `Failed to parse info.yaml: ${e}`,
    };
  }

  if (yamlObj?.yaml_version?.toString() !== '4') {
    return {
      error: `Incorrect 'yaml_version' in info.yaml: found ${yamlObj?.yaml_version}, expected 4`,
    };
  }

  const projectInfo = yamlObj?.project;
  if (!projectInfo) {
    return {
      error: `Missing 'project' section in info.yaml`,
    };
  }

  const documentationInfo = yamlObj?.documentation;
  if (!documentationInfo) {
    return {
      error: `Missing 'documentation' section in info.yaml`,
    };
  }

  const tiles = projectInfo.tiles;
  if (!tiles) {
    return {
      error: `Missing 'project.tiles' section in info.yaml`,
    };
  }

  const title = documentationInfo.title;
  if (!title) {
    return {
      error: `Missing 'documentation.title' section in info.yaml`,
    };
  }

  const author = documentationInfo.author;
  if (!author) {
    return {
      error: `Missing 'documentation.author' section in info.yaml`,
    };
  }

  const wokwiId = projectInfo?.wokwi_id?.toString();
  const topModuleName = projectInfo?.top_module;
  const isWokwiProject = wokwiId && wokwiId.toString() !== '0';

  if (!isWokwiProject && !topModuleName) {
    return {
      error: `Missing 'project.wokwi_id' or 'project.top_module' section in info.yaml`,
    };
  }

  const topModule = isWokwiProject ? `tt_um_wokwi_${wokwiId}` : topModuleName;

  if (topModuleName && !topModuleName.startsWith('tt_um_')) {
    return {
      error: `Invalid value for 'project.top_module' in info.yaml: got "${topModule}", expected a name starting with "tt_um_"`,
    };
  }

  const discordUser = documentationInfo.discord ?? '';
  const description = documentationInfo.description ?? '';
  const language = documentationInfo.language ?? '';
  const clockHz = documentationInfo.clock_hz ?? 0;
  const clockHzSerialized =
    typeof clockHz === 'bigint' ? clockHz.toString() : JSON.stringify(clockHz);
  const sourceFiles = projectInfo.source_files
    ?.map((item: string) => `    - ${JSON.stringify(item)}`)
    .join('\n');

  const mapPinName = (item: string) => {
    if (!item) {
      return '';
    }
    if (typeof item === 'object' && Object.keys(item).length === 1) {
      return `${Object.keys(item)[0]}: ${Object.values(item)[0]}`;
    }
    if (['none', 'unused', 'not used'].includes(item.toLowerCase())) {
      return '';
    }
    return item;
  };
  const inputs = (documentationInfo.inputs ?? []).map(mapPinName);
  const outputs = (documentationInfo.outputs ?? []).map(mapPinName);
  const bedirs = (documentationInfo.bidirectional ?? []).map(mapPinName);

  const verilogSection = `
  # Your top module name must start with "tt_um_". Make it unique by including your github username:
  top_module:  ${JSON.stringify(topModule)}

  # List your project's source files here. Source files must be in ./src and you must list each source file separately, one per line:
  source_files:
${sourceFiles}
`;

  const extraDocs = documentationInfo.external_hw
    ? `
## External Hardware

${documentationInfo.external_hw}
`
    : '';

  return {
    yaml: `# Tiny Tapeout project information
project:${
      isWokwiProject
        ? `\n  wokwi_id:     ${wokwiId}       # Set this to the ID of your Wokwi project (the number from the project's URL)`
        : ''
    }
  title:        ${JSON.stringify(title)}      # Project title
  author:       ${JSON.stringify(author)}      # Your name
  discord:      ${JSON.stringify(
    discordUser,
  )}      # Your discord username, for communication and automatically assigning you a Tapeout role (optional)
  description:  ${JSON.stringify(description)}      # One line description of what your project does
  language:     ${JSON.stringify(language)} # other examples include SystemVerilog, Amaranth, VHDL, etc
  clock_hz:     ${clockHzSerialized}       # Clock frequency in Hz (or 0 if not applicable)

  # How many tiles your design occupies? A single tile is about 167x108 uM.
  tiles: ${JSON.stringify(tiles)}          # Valid values: 1x1, 1x2, 2x2, 3x2, 4x2, 6x2 or 8x2
${isWokwiProject ? '' : verilogSection}
# The pinout of your project. Leave unused pins blank. DO NOT delete or add any pins.
pinout:
  # Inputs
  ui[0]: ${JSON.stringify(inputs[0] ?? '')}
  ui[1]: ${JSON.stringify(inputs[1] ?? '')}
  ui[2]: ${JSON.stringify(inputs[2] ?? '')}
  ui[3]: ${JSON.stringify(inputs[3] ?? '')}
  ui[4]: ${JSON.stringify(inputs[4] ?? '')}
  ui[5]: ${JSON.stringify(inputs[5] ?? '')}
  ui[6]: ${JSON.stringify(inputs[6] ?? '')}
  ui[7]: ${JSON.stringify(inputs[7] ?? '')}

  # Outputs
  uo[0]: ${JSON.stringify(outputs[0] ?? '')}
  uo[1]: ${JSON.stringify(outputs[1] ?? '')}
  uo[2]: ${JSON.stringify(outputs[2] ?? '')}
  uo[3]: ${JSON.stringify(outputs[3] ?? '')}
  uo[4]: ${JSON.stringify(outputs[4] ?? '')}
  uo[5]: ${JSON.stringify(outputs[5] ?? '')}
  uo[6]: ${JSON.stringify(outputs[6] ?? '')}
  uo[7]: ${JSON.stringify(outputs[7] ?? '')}

  # Bidirectional pins
  uio[0]: ${JSON.stringify(bedirs[0] ?? '')}
  uio[1]: ${JSON.stringify(bedirs[1] ?? '')}
  uio[2]: ${JSON.stringify(bedirs[2] ?? '')}
  uio[3]: ${JSON.stringify(bedirs[3] ?? '')}
  uio[4]: ${JSON.stringify(bedirs[4] ?? '')}
  uio[5]: ${JSON.stringify(bedirs[5] ?? '')}
  uio[6]: ${JSON.stringify(bedirs[6] ?? '')}
  uio[7]: ${JSON.stringify(bedirs[7] ?? '')}

# Do not change!
yaml_version: 6
`,

    markdown:
      `<!---

This file is used to generate your project datasheet. Please fill in the information below and delete any unused
sections.

You can also include images in this folder and reference them in the markdown. Each image must be less than
512 kb in size, and the combined size of all images must be less than 1 MB.
-->

## How it works

${documentationInfo.how_it_works.trim()}

## How to test

${documentationInfo.how_to_test.trim()}
` + extraDocs,
  };
}
