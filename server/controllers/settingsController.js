import UserSettings from '../models/UserSettings.js';
import User from '../models/User.js';

// @desc    Get current user settings
// @route   GET /api/settings
// @access  Private
export const getSettings = async (req, res, next) => {
  try {
    let settings = await UserSettings.findOne({ user: req.user.id });

    if (!settings) {
      settings = await UserSettings.create({
        user: req.user.id,
        currency: req.user.currency || 'INR',
      });
    }

    res.status(200).json({
      success: true,
      settings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user settings
// @route   PUT /api/settings
// @access  Private
export const updateSettings = async (req, res, next) => {
  try {
    const {
      currency,
      monthlyIncomeTarget,
      monthlyBudgetLimit,
      theme,
      spendingAlertThreshold,
      notificationsEnabled,
      dateFormat,
    } = req.body;

    let settings = await UserSettings.findOne({ user: req.user.id });

    if (!settings) {
      settings = new UserSettings({ user: req.user.id });
    }

    if (currency) {
      settings.currency = currency.toUpperCase();
      await User.findByIdAndUpdate(req.user.id, { currency: currency.toUpperCase() });
    }
    if (monthlyIncomeTarget !== undefined) settings.monthlyIncomeTarget = parseFloat(monthlyIncomeTarget);
    if (monthlyBudgetLimit !== undefined) settings.monthlyBudgetLimit = parseFloat(monthlyBudgetLimit);
    if (theme && ['light', 'dark'].includes(theme)) settings.theme = theme;
    if (spendingAlertThreshold !== undefined) settings.spendingAlertThreshold = parseInt(spendingAlertThreshold, 10);
    if (notificationsEnabled !== undefined) settings.notificationsEnabled = Boolean(notificationsEnabled);
    if (dateFormat) settings.dateFormat = dateFormat;

    await settings.save();

    res.status(200).json({
      success: true,
      message: 'Settings updated successfully.',
      settings,
    });
  } catch (error) {
    next(error);
  }
};
