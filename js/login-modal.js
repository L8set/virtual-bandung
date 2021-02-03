var VirtualBandung = VirtualBandung || {};
VirtualBandung.Login = VirtualBandung.Login || {};

(() => {
  const Selector = {
    LOGIN_AREA: '#loginArea',
    FORM: '#form',
    EMAIL: '#mailAddress',
    SIGNUP_FIELDS: '#signupFields',
    AGE: '#age',
    BIRTHPLACE: '#birthplace',
    RESIDENCE: '#residence',
    SEX: '#sex',
    MODE: '#mode',
    SIGNUP: '.login-contents__signup',
    ENTER_BTN: '#enterBtn',
    FORM_INPUT: '[name="formInput"]',
    MSG: '#msg',
    Message: {
      EMAIL: '#mailAddressMsg',
      AGE: '#ageMsg',
      BIRTHPLACE: '#birthplaceMsg',
      RESIDENCE: '#residenceMsg',
      SEX: '#sexMsg'
    }
  };

  const CssClass = {
    HIDDEN: 'login-contents__hidden'
  };

  const Color = {
    NON_SELECTED: 'rgb(126, 126, 126)',
    DEFAULT: 'black'
  };

  const SendMode = {
    LOGIN: 1,
    SIGNUP: 2
  };

  const FadeMode = {
    IN: 1,
    OUT: 2
  };

  const Result = {
    OK: 'ok',
    NG: 'ng'
  };

  const SessionKey = {
    ID: 'virtual_bandung_login_id'
  };

  const webAppUrl = 'https://script.google.com/macros/s/AKfycbzBsIYHoMt4qV01d6hwTEpxMEXqxchGka5w7Ask-J2FRvfJnnB_FQy2UQ/exec';

  const ageMap = new Map([['1', '～15'], ['2', '16～20'], ['3', '21～25'], ['4', '26～30'], ['5', '31～40'], ['6', '41～50'], ['7', '51～']]);
  const countrySet = new Set(["Japan", "Indonesia", "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burma", "Burundi", "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Costa Rica", "Côte d’Ivoire", "Croatia", "Cuba", "Cyprus", "Czechia", "Democratic Republic of the Congo", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Holy See", "Honduras", "Hungary", "Iceland", "India", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kosovo", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Republic of the Congo", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "São Tomé and Príncipe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "Uruguay", "Uzbekistan", "Vanuatu", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"]);
  const sexMap = new Map([['1', 'Male'], ['2', 'Female'], ['3', 'Other']]);

  const mailAddressPattern = new RegExp(/^[a-zA-Z0-9_+-]+(.[a-zA-Z0-9_+-]+)*@([a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.)+[a-zA-Z]{2,}$/);
  
  function createOptions(selector, list) {
    const select = document.querySelector(selector);

    updateSelectFont(select);
    select.addEventListener('change', e => updateSelectFont(e.currentTarget));
  
    list.forEach((optionName, optionId) => {
      const option = document.createElement('option');
      option.value = optionId;
      option.text = optionName;
      option.style.color = Color.DEFAULT;
      select.appendChild(option);
    });
  }

  function createSignUpContents() {
    createOptions(Selector.AGE, ageMap);
    createOptions(Selector.BIRTHPLACE, countrySet);
    createOptions(Selector.RESIDENCE, countrySet);
    createOptions(Selector.SEX, sexMap);
  }
  
  function fade(node, duration, mode) {
    const fadeInFlg = mode === FadeMode.IN;
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

  function updateSelectFont(element) {
    const {value, style} = element;
  
    if ((!value && style.color === Color.NON_SELECTED)
        || (!!value && style.color === Color.DEFAULT)) {
      return;
    } else if (!value) {
      style.color = Color.NON_SELECTED;
    } else {
      style.color = Color.DEFAULT;
    }
  }

  function showSignupFields() {
    const signupFields = document.querySelector(Selector.SIGNUP_FIELDS);
    if (signupFields.classList.contains(CssClass.HIDDEN)) {
      signupFields.classList.remove(CssClass.HIDDEN);
    }
  }

  function checkField(fieldSelector, msgSelector, test) {
    const {value} = document.querySelector(fieldSelector);
    const {classList: msgClassList} = document.querySelector(msgSelector);
    if (test(value)) {
      if (!msgClassList.contains(CssClass.HIDDEN)) {
        msgClassList.add(CssClass.HIDDEN);
      }
      return true;
    } else if (msgClassList.contains(CssClass.HIDDEN)) {
      msgClassList.remove(CssClass.HIDDEN);
    }
    return false;
  }

  function checkMailAddress() {
    return checkField(Selector.EMAIL, Selector.Message.EMAIL, (value) => mailAddressPattern.test(value));
  }

  function checkSelectField(fieldSelector, msgSelector) {
    return VirtualBandung.Login.mode === SendMode.LOGIN
        || checkField(fieldSelector, msgSelector, (value) => !!value);
  }

  function checkInput() {
    return checkMailAddress()
        && checkSelectField(Selector.AGE, Selector.Message.AGE)
        && checkSelectField(Selector.BIRTHPLACE, Selector.Message.BIRTHPLACE)
        && checkSelectField(Selector.RESIDENCE, Selector.Message.RESIDENCE)
        && checkSelectField(Selector.SEX, Selector.Message.SEX);
  }

  function sendForm() {
    if (!checkInput()) return false;

    const queryParams = Array.from(document.querySelectorAll(Selector.FORM_INPUT))
        .filter(input => input)
        .reduce((params, element) => {
          params.append(element.id, element.value || '');
          return params;
        }, new URLSearchParams());
    fetch(`${webAppUrl}?${queryParams}`)
        .then(response => response.json())
        .then(response => {
          switch (response.result) {
          case Result.OK:
            VirtualBandung.Login.id = response.id;
            window.sessionStorage.setItem([SessionKey.ID], [VirtualBandung.Login.id])
            VirtualBandung.Login.msg = '';
            const loginArea = document.querySelector(Selector.LOGIN_AREA);
            fade(loginArea, 500, FadeMode.OUT);
            break;
          case Result.NG:
          default:
            VirtualBandung.Login.id = 0;
            VirtualBandung.Login.msg = response.msg;

            const modeElement = document.querySelector(Selector.MODE);
            showSignupFields();
            modeElement.value = VirtualBandung.Login.mode = SendMode.SIGNUP;

            const msgElement = document.querySelector(Selector.MSG);
            const msgText = document.createTextNode(VirtualBandung.Login.msg);
            msgElement.innerHTML = '';
            msgElement.appendChild(msgText);
            break;
          }
        });
    return false;
  }
  
  function init() {
    const loginArea = document.querySelector(Selector.LOGIN_AREA);
    fade(loginArea, 500, FadeMode.IN);

    const enterBtn = document.querySelector(Selector.ENTER_BTN);
    enterBtn.addEventListener('click', sendForm);

    const form = document.querySelector(Selector.FORM);
    form.addEventListener('submit', sendForm);

    VirtualBandung.Login.mode = SendMode.LOGIN;
  }

  VirtualBandung.Login.id = window.sessionStorage.getItem([SessionKey.ID]);
  if (!VirtualBandung.Login.id) {
    init();
    createSignUpContents();
  }
})(this);