
// Hàm 
function Validator(options) {


    // Hàm để tìm cha vì khi có nhiều cấp sẽ không thể lấy cha bằng 
    // var errorElement = inputElement.parentElement.querySelector(options.errorSelector)

    function getParent(element, selector) {
        while (element.parentElement) {
            if (element.parentElement.matches(selector)) {
                return element.parentElement;
            }
            element = element.parentElement
            // Nếu chúng ta tìm ra cấp cha trước nó, nếu không mach với thẻ cha thì gán thành cha nó luôn
        }
    }


    // Lưu tất cả các rule của selector vào đây
    var selectorRules = {}


    // Hàm thực hiện validate
    function validate(inputElement, rule) {
        var errorMessage;
        // var errorElement = inputElement.parentElement.querySelector('.form-message')
        // Đổi thành
        var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector)

        // Lấy ra các rules của selector
        var rules = selectorRules[rule.selector]
        //Lặp qua từng rule và kiểm tra
        // Nếu lỗi thì dừng kiểm tra (break)
        for (var i = 0; i < rules.length; i++) {
            switch (inputElement.type) {
                case 'radio':
                case 'checkbox':
                    errorMessage = rules[i](formElement.querySelector(rule.selector + ':checked'));
                    break;
                default:
                    errorMessage = rules[i](inputElement.value);
            }
            if (errorMessage) break;
        }

        if (errorMessage) {
            errorElement.innerText = errorMessage;
            getParent(inputElement, options.formGroupSelector).classList.add('invalid')
        } else {
            errorElement.innerText = ""
            getParent(inputElement, options.formGroupSelector).classList.remove('invalid')
        }

        return !errorMessage
    }

    // Lấy element của form cần validate
    var formElement = document.querySelector(options.form)
    if (formElement) {
        // Khi submitfrom
        formElement.onsubmit = function (e) {

            var isFormValid = true;
            e.preventDefault();

            // Thực hiện lặp qua từng rules và validate
            options.rules.forEach(function (rule) {
                var inputElement = formElement.querySelector(rule.selector);
                validate(inputElement, rule)
                var isValid = validate(inputElement, rule)
                if (!isValid) {
                    isFormValid = false
                }
            });


            if (isFormValid) {
                // Trường hợp submit với JavaScript
                if (typeof options.onSubmit === 'function') {
                    var enableInputs = formElement.querySelectorAll('[name]:not([disabled])')
                    var formValues = Array.from(enableInputs).reduce(function (values, input) {

                        switch (input.type) {
                            case 'radio':
                                values[input.name] = formElement.querySelector('input[name="' + input.name + '"]:checked').value;
                                break;
                            case 'checkbox':
                                if (!input.matches(':checked')) return values;
                                if (!Array.isArray(values[input.name])) {
                                    values[input.name] = []
                                }
                                values[input.name].push(input.value)
                                break;
                            case 'file':
                                values[input.name] = input.files;
                                break;
                            default:
                                values[input.name] = input.value
                        }
                        return values
                    }, {});

                    options.onSubmit(formValues);
                }
                // Trường hợp submit HTML mặc định
                else {
                    formElement.submit();
                }


            }
        }


        // options.rules là một array
        // Xử lý lặp qua mỗi rule (lắng nghe sự kiện, blur, input,..)
        options.rules.forEach(function (rule) {

            //selectorRules[rule.selector] = rule.test;// Nếu gán sẽ bị ghi đè
            // Lưu lại các rule cho mỗi input
            if (Array.isArray(selectorRules[rule.selector])) {
                selectorRules[rule.selector].push(rule.test);
            }
            else {
                selectorRules[rule.selector] = [rule.test]; // Trả về mảng nếu có 1 phần tử
            }



            var inputElements = formElement.querySelectorAll(rule.selector);

            Array.from(inputElements).forEach(function (inputElement) {
                // Xử lý trường hợp blur khỏi input
                inputElement.onblur = function () {
                    validate(inputElement, rule)
                }

                // Xử lý trường hợp khi blur khỏi Email--> Nhấn vào gõ vần còn báo lỗi
                inputElement.oninput = function () {
                    var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector)
                    errorElement.innerText = ""
                    getParent(inputElement, options.formGroupSelector).classList.remove('invalid')
                }
            })
        });
    }
}

// Định nghĩa các rules / Điều luật, luật lệ bắt buộc
// Nguyên tắt các rules:
// 1. Khi co lỗi trả message Lỗi
// 2. Khi hợp lệ ko trả ra gì cả

// Rule Họ và tên
Validator.isRequired = function (selector, message) {
    return {
        selector: selector,
        test: function (value) {
            return value ? undefined : message || 'Vui lòng nhập trường này'
        }
    }
}


// Rule Email
Validator.isEmail = function (selector, message) {
    return {
        selector: selector,
        test: function (value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/

            return regex.test(value) ? undefined : message || 'Trường này phải là email'
        }
    }
}

// Rule Mật khẩu

Validator.minLength = function (selector, min, message) {
    return {
        selector: selector,
        test: function (value) {
            return value.length >= min ? undefined : message || `Mật khẩu tối thiểu ${min} kí tự`;
        }
    }
}

Validator.isConfirm = function (selector, getValueConfirm, message) {
    // thêm biết message để dùng lại. Nếu hackcode (fig cứng)
    return {
        selector: selector,
        test: function (value) {
            return value === getValueConfirm() ? undefined : message || 'Giá trị nhập vào không chính xác'
        }
    }
}