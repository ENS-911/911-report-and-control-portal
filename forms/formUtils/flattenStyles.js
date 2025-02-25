export function flattenStyles(stylesObj) {
    return {
      // Container settings.
      containerPadding: stylesObj.container.padding + "px",
      containerBackgroundColor: stylesObj.container.backgroundColor,
      // Current block (assuming your component expects these keys).
      currentBlockFontSize: stylesObj.currentBlock.fontSize + "px",
      currentBlockTextColor: stylesObj.currentBlock.textColor,
      currentBlockBackgroundColor: stylesObj.currentBlock.backgroundColor,
      currentBlockWidth: stylesObj.currentBlock.width + "%",
      currentBlockBorderThickness: stylesObj.currentBlock.borderThickness + "px",
      currentBlockBorderColor: stylesObj.currentBlock.borderColor,
      currentBlockBorderRadius: stylesObj.currentBlock.borderRadius + "px",
      currentBlockPadding: stylesObj.currentBlock.padding + "px",
      currentBlockMargin: stylesObj.currentBlock.margin + "px",
      // Daily block.
      dailyBlockFontSize: stylesObj.dailyBlock.fontSize + "px",
      dailyBlockTextColor: stylesObj.dailyBlock.textColor,
      dailyBlockBackgroundColor: stylesObj.dailyBlock.backgroundColor,
      dailyBlockWidth: stylesObj.dailyBlock.width + "%",
      dailyBlockBorderThickness: stylesObj.dailyBlock.borderThickness + "px",
      dailyBlockBorderColor: stylesObj.dailyBlock.borderColor,
      dailyBlockBorderRadius: stylesObj.dailyBlock.borderRadius + "px",
      dailyBlockPadding: stylesObj.dailyBlock.padding + "px",
      dailyBlockMargin: stylesObj.dailyBlock.margin + "px",
      // Yearly block.
      yearlyBlockFontSize: stylesObj.yearlyBlock.fontSize + "px",
      yearlyBlockTextColor: stylesObj.yearlyBlock.textColor,
      yearlyBlockBackgroundColor: stylesObj.yearlyBlock.backgroundColor,
      yearlyBlockWidth: stylesObj.yearlyBlock.width + "%",
      yearlyBlockBorderThickness: stylesObj.yearlyBlock.borderThickness + "px",
      yearlyBlockBorderColor: stylesObj.yearlyBlock.borderColor,
      yearlyBlockBorderRadius: stylesObj.yearlyBlock.borderRadius + "px",
      yearlyBlockPadding: stylesObj.yearlyBlock.padding + "px",
      yearlyBlockMargin: stylesObj.yearlyBlock.margin + "px",
      // Clock.
      clockShow: stylesObj.clock.show,
      clockHourFormat: stylesObj.clock.hourFormat,
      clockFontSize: stylesObj.clock.fontSize + "px",
      clockTextColor: stylesObj.clock.textColor,
      clockBackgroundColor: stylesObj.clock.backgroundColor,
      clockBorderThickness: stylesObj.clock.borderThickness + "px",
      clockBorderColor: stylesObj.clock.borderColor,
      clockBorderRadius: stylesObj.clock.borderRadius + "px",
      clockPadding: stylesObj.clock.padding + "px",
      clockMargin: stylesObj.clock.margin + "px",
      clockWidth: stylesObj.clock.width + "%"
    };
  }