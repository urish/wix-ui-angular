/* wix-ui-angular.js / v0.1.0 / (c) 2013, 2014 Uri Shaked / MIT Licence */

'use strict';

angular.module('wix-ui', [])
    .service('wixUICommon', function ($timeout) {
        this.bindPluginToModel = function (element, pluginName, ngModel, transformViewValue, transformModelValue) {
            if (ngModel) {
                ngModel.$render = angular.bind(this, function () {
                    if (angular.isDefined(ngModel.$viewValue)) {
                        var modelValue = ngModel.$viewValue;
                        if (transformModelValue) {
                            modelValue = transformModelValue(modelValue);
                        }
                        this.getPlugin(element, pluginName).setValue(modelValue);
                    }
                });
                element.on(pluginName + '.change', function (event, newValue) {
                    if (transformViewValue) {
                        newValue = transformViewValue(newValue);
                    }
                    $timeout(function () {
                        ngModel.$setViewValue(newValue);
                    });
                });
            }
        };

        this.getPlugin = function (element, pluginName) {
            return element.data('plugin_' + pluginName);
        };
    })
    .directive('wixEnable', function () {
        return function (scope, element, attr) {
            scope.$watch(attr.wixEnable, function (value) {
                if (value) {
                    element.css('pointer-events', 'auto');
                } else {
                    element.css('pointer-events', 'none');
                }
            });
        };
    })
    .directive('wixAccordion', function () {
        return function (scope, element) {
            jQuery(element).Accordion();
        };
    })
    .directive('wixButtonGroup', function (wixUICommon) {
        return {
            require: '?ngModel',
            link: function (scope, element, attrs, ngModel) {
                jQuery(element).ButtonGroup();
                wixUICommon.bindPluginToModel(element, 'ButtonGroup', ngModel, function (newValue) {
                    return newValue.value;
                });
            }
        };
    })
    .directive('wixColorPicker', function (wixUICommon, wixColors) {
        return {
            require: '?ngModel',
            link: function (scope, element, attrs, ngModel) {
                jQuery(element).ColorPicker();
                var plugin = wixUICommon.getPlugin(element, 'ColorPicker');
                plugin.isParamConected = true;

                function transformViewValue(newValue) {
                    if (newValue.color && newValue.color.reference) {
                        return wixColors.encodeWixColor(newValue.color);
                    } else {
                        return newValue.cssColor;
                    }
                }

                function transformModelValue(newValue) {
                    if (newValue.indexOf('$') >= 0) {
                        return {
                            color: wixColors.getColorByReference(newValue)
                        };
                    } else {
                        return newValue;
                    }
                }

                wixUICommon.bindPluginToModel(element, 'ColorPicker', ngModel, transformViewValue, transformModelValue);
            }
        };
    })
    .directive('wixCheckbox', function (wixUICommon) {
        return {
            require: '?ngModel',
            link: function (scope, element, attrs, ngModel) {
                jQuery(element).Checkbox();
                wixUICommon.bindPluginToModel(element, 'Checkbox', ngModel);
            }
        };
    })
    .directive('wixCheckboxLabel', function () {
        return function (scope, element) {
            element.on('click', function () {
                element.prev('[wix-checkbox]').click();
            });
        };
    })
    .directive('wixLanguagePicker', function (wixUICommon) {
        return {
            require: '?ngModel',
            link: function (scope, element, attrs, ngModel) {
                jQuery(element).LanguagePicker({
                    languages: ['En', 'Es', 'Pt', 'Ru', 'Fr', 'De', 'It', 'Pl', 'Ja', 'Ko', 'Tr', 'Nl', 'He', 'Ar', 'Zh', 'Nb']
                });

                // Workaround - add languages that do not currently appear in wix-ui-lib
                element.find('div[data-value=He]:not(.current-item)').text('עברית');
                element.find('div[data-value=Ar]:not(.current-item)').text('العربية');
                element.find('div[data-value=Pl]:not(.current-item)').text('Polski');
                element.find('div[data-value=Nl]:not(.current-item)').text('Dutch');
                element.find('div[data-value=Zh]:not(.current-item)').text('中文(繁體)');
                element.find('div[data-value=Nb]:not(.current-item)').text('Norsk bokmål');

                function transformViewValue(viewValue) {
                    return viewValue.value.toLowerCase();
                }

                function transformModelValue(modelValue) {
                    if (typeof modelValue === 'string') {
                        return modelValue[0].toUpperCase() + modelValue[1].toLowerCase();
                    }
                    return modelValue;
                }

                wixUICommon.bindPluginToModel(element, 'LanguagePicker', ngModel, transformViewValue, transformModelValue);
            }
        };
    })
    .directive('wixSpinner', function (wixUICommon) {
        return {
            require: '?ngModel',
            link: function (scope, element, attrs, ngModel) {
                jQuery(element).Spinner({
                    size: 'medium'
                });
                var pluginName = 'Spinner';
                wixUICommon.bindPluginToModel(element, pluginName, ngModel);
                attrs.$observe('min', function (newValue) {
                    var plugin = wixUICommon.getPlugin(element, pluginName);
                    if (angular.isUndefined(newValue)) {
                        newValue = plugin.getDefaults().minValue;
                    }
                    plugin.options.minValue = parseInt(newValue, 10);
                });
                attrs.$observe('max', function (newValue) {
                    var plugin = wixUICommon.getPlugin(element, pluginName);
                    if (angular.isUndefined(newValue)) {
                        newValue = plugin.getDefaults().maxValue;
                    }
                    plugin.options.maxValue = parseInt(newValue, 10);
                });
            }
        };
    });