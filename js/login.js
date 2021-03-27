var VirtualBandung = VirtualBandung || {};
VirtualBandung.Login = VirtualBandung.Login || {};

(() => {
  const CONSTS = {
    ELEMENT_ID: {
      LOGIN_AREA: 'loginArea',
      FORM: 'form',
      EMAIL: 'mailAddress',
      SIGNUP_FIELDS: 'signupFields',
      AGE: 'age',
      BIRTHPLACE: 'birthplace',
      RESIDENCE: 'residence',
      SEX: 'sex',
      MODE: 'mode',
      ENTER_BTN: 'enterBtn',
      MSG: 'msg',
      Message: {
        EMAIL: 'mailAddressMsg',
        AGE: 'ageMsg',
        BIRTHPLACE: 'birthplaceMsg',
        RESIDENCE: 'residenceMsg',
        SEX: 'sexMsg'
      },
      LP_LINK: 'lp',
      OPEN_FLG: 'openFlg',
      PRELOADER: 'preloader'
    },
    ELEMENT_NAME: {
      FORM_INPUT: 'formInput'
    },
    CSS_CLASS: {
      HIDDEN: 'login-contents__hidden'
    },
    COLOR: {
      NON_SELECTED: 'rgb(126, 126, 126)',
      DEFAULT: 'black'
    },
    SEND_MODE: {
      LOGIN: 1,
      SIGNUP: 2
    },
    FADE_MODE: {
      IN: 1,
      OUT: 2
    },
    RESULT_CODE: {
      OK: 'ok',
      NG: 'ng'
    },
    SESSION_KEY: {
      ID: 'virtual_bandung_login_id'
    },
    TEST_KEY: '//test',
    URL: 'https://script.google.com/macros/s/AKfycbwm5_I8b8DG3Q4Og0qHBOBr3jpefDI7ri4VR_oxtvvqcI5nm3fbnMtxoQ/exec',
    AGE_MAP: new Map([['1', '～15'], ['2', '16～20'], ['3', '21～25'], ['4', '26～30'], ['5', '31～40'], ['6', '41～50'], ['7', '51～']]),
    COUNTRY_SET: new Set(["Japan", "Indonesia", "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burma", "Burundi", "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Costa Rica", "Côte d’Ivoire", "Croatia", "Cuba", "Cyprus", "Czechia", "Democratic Republic of the Congo", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Holy See", "Honduras", "Hungary", "Iceland", "India", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kosovo", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Republic of the Congo", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "São Tomé and Príncipe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "Uruguay", "Uzbekistan", "Vanuatu", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"]),
    SEX_MAP: new Map([['1', 'Male'], ['2', 'Female'], ['3', 'Other']])
  };

  const OPEN_FLGS = {
    CHALLENGE: 'challenge',
    STARTED: 'started'
  };

  const mailAddressPattern = new RegExp(/^[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)*@([a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.)+[a-zA-Z]{2,}$/);

  const CommonUtil = new class {

    fade(node, duration, mode) {
      const fadeInFlg = mode === CONSTS.FADE_MODE.IN;
      if ((fadeInFlg && getComputedStyle(node).display !== 'none') || (!fadeInFlg && getComputedStyle(node).display === 'none')) return;

      node.style.display = 'block';
      node.style.opacity = fadeInFlg ? 0 : 1;

      const start = performance.now();

      const tick = timestamp => {
        const easing = (timestamp - start) / duration;

        node.style.opacity = fadeInFlg ? Math.min(easing, 1) : Math.max(1 - easing, 0);

        if (easing < 1) {
          requestAnimationFrame(tick);
        } else {
          node.style.opacity = fadeInFlg ? 1 : 0;
          if (!fadeInFlg) {
            node.style.display = 'none';
          }
        }
      }

      requestAnimationFrame(tick);
    }
  };

  const ContentsCreator = new class {

    createOptions(id, list) {
      const select = document.getElementById(id);

      FormUpdator.updateSelectFont(select);
      select.addEventListener('change', e => FormUpdator.updateSelectFont(e.currentTarget));

      list.forEach((optionName, optionId) => {
        const option = document.createElement('option');
        option.value = optionId;
        option.text = optionName;
        option.style.color = CONSTS.COLOR.DEFAULT;
        select.appendChild(option);
      });
    }

    createSignUpContents() {
      this.createOptions(CONSTS.ELEMENT_ID.AGE, CONSTS.AGE_MAP);
      this.createOptions(CONSTS.ELEMENT_ID.BIRTHPLACE, CONSTS.COUNTRY_SET);
      this.createOptions(CONSTS.ELEMENT_ID.RESIDENCE, CONSTS.COUNTRY_SET);
      this.createOptions(CONSTS.ELEMENT_ID.SEX, CONSTS.SEX_MAP);
    }
  };

  const FormUpdator = new class {

    updateMailAddress() {
      const mailAddress = document.getElementById(CONSTS.ELEMENT_ID.EMAIL);
      const { value } = mailAddress;
      mailAddress.value = value.replace(/\s/g, '');
    }

    updateSelectFont(element) {
      const { value, style } = element;

      if ((!value && style.color === CONSTS.COLOR.NON_SELECTED)
        || (!!value && style.color === CONSTS.COLOR.DEFAULT)) {
        return;
      } else if (!value) {
        style.color = CONSTS.COLOR.NON_SELECTED;
      } else {
        style.color = CONSTS.COLOR.DEFAULT;
      }
    }
  };

  const FormSender = new class {

    checkField(fieldId, msgId, test) {
      const { value } = document.getElementById(fieldId);
      const { classList: msgClassList } = document.getElementById(msgId);
      if (test(value)) {
        if (!msgClassList.contains(CONSTS.CSS_CLASS.HIDDEN)) {
          msgClassList.add(CONSTS.CSS_CLASS.HIDDEN);
        }
        return true;
      } else if (msgClassList.contains(CONSTS.CSS_CLASS.HIDDEN)) {
        msgClassList.remove(CONSTS.CSS_CLASS.HIDDEN);
      }
      return false;
    }

    checkSelectField(fieldId, msgId) {
      return VirtualBandung.Login.mode === CONSTS.SEND_MODE.LOGIN
        || this.checkField(fieldId, msgId, (value) => !!value);
    }

    checkMailAddress() {
      return this.checkField(CONSTS.ELEMENT_ID.EMAIL, CONSTS.ELEMENT_ID.Message.EMAIL, (value) => mailAddressPattern.test(value));
    }

    checkInput() {
      return [
        this.checkMailAddress(),
        this.checkSelectField(CONSTS.ELEMENT_ID.AGE, CONSTS.ELEMENT_ID.Message.AGE),
        this.checkSelectField(CONSTS.ELEMENT_ID.BIRTHPLACE, CONSTS.ELEMENT_ID.Message.BIRTHPLACE),
        this.checkSelectField(CONSTS.ELEMENT_ID.RESIDENCE, CONSTS.ELEMENT_ID.Message.RESIDENCE),
        this.checkSelectField(CONSTS.ELEMENT_ID.SEX, CONSTS.ELEMENT_ID.Message.SEX)
      ].every(result => result);
    }

    checkMode() {
      const mailElement = document.getElementById(CONSTS.ELEMENT_ID.EMAIL);
      if (mailElement.value.endsWith(CONSTS.TEST_KEY)) {
        document.getElementById(CONSTS.ELEMENT_ID.LP_LINK).click();
      }
    }

    sendForm() {
      this.checkMode();
      if (!this.checkInput()) return false;

      const queryParams = Array.from(document.getElementsByName(CONSTS.ELEMENT_NAME.FORM_INPUT))
        .filter(input => input)
        .reduce((params, element) => {
          params.append(element.id, element.value || '');
          return params;
        }, new URLSearchParams());

      const preloader = document.getElementById(CONSTS.ELEMENT_ID.PRELOADER);
      if (preloader.classList.contains(CONSTS.CSS_CLASS.HIDDEN)) {
        preloader.classList.remove(CONSTS.CSS_CLASS.HIDDEN);
      }
      fetch(`${CONSTS.URL}?${queryParams}`)
        .then(response => { console.log(response); return response.json() })
        .then(response => {
          if (!preloader.classList.contains(CONSTS.CSS_CLASS.HIDDEN)) {
            preloader.classList.add(CONSTS.CSS_CLASS.HIDDEN);
          }
          switch (response.result) {
            case CONSTS.RESULT_CODE.OK:
              VirtualBandung.Login.id = response.id;
              window.sessionStorage.setItem([CONSTS.SESSION_KEY.ID], [VirtualBandung.Login.id])
              VirtualBandung.Login.msg = '';
              if (document.getElementById(CONSTS.ELEMENT_ID.OPEN_FLG).value === OPEN_FLGS.CHALLENGE) {
                const loginArea = document.getElementById(CONSTS.ELEMENT_ID.LOGIN_AREA);
                CommonUtil.fade(loginArea, 500, CONSTS.FADE_MODE.OUT);
                showMessage();
              } else {
                document.getElementById(CONSTS.ELEMENT_ID.LP_LINK).click();
              }
              break;
            case CONSTS.RESULT_CODE.NG:
            default:
              VirtualBandung.Login.id = 0;
              VirtualBandung.Login.msg = response.msg;

              const modeElement = document.getElementById(CONSTS.ELEMENT_ID.MODE);
              this.showSignupFields();
              modeElement.value = VirtualBandung.Login.mode = CONSTS.SEND_MODE.SIGNUP;

              const msgElement = document.getElementById(CONSTS.ELEMENT_ID.MSG);
              const msgText = document.createTextNode(VirtualBandung.Login.msg);
              msgElement.innerHTML = '';
              msgElement.appendChild(msgText);
              break;
          }
        });
      return false;
    }

    showSignupFields() {
      const signupFields = document.getElementById(CONSTS.ELEMENT_ID.SIGNUP_FIELDS);
      if (signupFields.classList.contains(CONSTS.CSS_CLASS.HIDDEN)) {
        signupFields.classList.remove(CONSTS.CSS_CLASS.HIDDEN);
      }
    }
  };

  function showMessage() {
    const loginMessageOk = document.getElementById('loginMessageOk');
    loginMessageOk.addEventListener('click', () => closeLoginMessage())
    const messageArea = document.getElementById('challengeMessage');
    const id = setInterval(() => {
      messageArea.style.opacity = String((parseFloat(messageArea.style.opacity) || 0) + 0.01);
      if (parseFloat(messageArea.style.opacity) >= 1) {
        messageArea.style.opacity = 1;
        clearInterval(id);
      }
    }, 16);
  }

  function closeLoginMessage() {
    const loginMessage = document.getElementById('loginMessage');
    if (!loginMessage.classList.contains(CONSTS.CSS_CLASS.HIDDEN)) {
      loginMessage.classList.add(CONSTS.CSS_CLASS.HIDDEN);
    }
  }

  function init() {

    const loginArea = document.getElementById(CONSTS.ELEMENT_ID.LOGIN_AREA);
    CommonUtil.fade(loginArea, 500, CONSTS.FADE_MODE.IN);

    const form = document.getElementById(CONSTS.ELEMENT_ID.FORM);
    form.addEventListener('submit', FormSender.sendForm.bind(FormSender));

    const mailAddress = document.getElementById(CONSTS.ELEMENT_ID.EMAIL);
    mailAddress.addEventListener('blur', FormUpdator.updateMailAddress);

    const enterBtn = document.getElementById(CONSTS.ELEMENT_ID.ENTER_BTN);
    enterBtn.addEventListener('click', FormSender.sendForm.bind(FormSender));

    VirtualBandung.Login.mode = CONSTS.SEND_MODE.LOGIN;
  }

  {
    VirtualBandung.Login.id = window.sessionStorage.getItem([CONSTS.SESSION_KEY.ID]);
    init();
    ContentsCreator.createSignUpContents();
  }
})(this);