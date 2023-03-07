export const MINUTE_MS = 60000
export const HOUR_MS = MINUTE_MS * 60
export const DAY_MS = HOUR_MS * 24
export type ChainIdType = 'X' | 'P' | 'C'
export const kycStyleNight =
    "html {background : #0f172a}\
.step.active .line, .step.active .bullet:before, .radio-item .checkmark:after, .step.active.pending .bullet:before {\
background-color: #149ded;\
}\
.accent {\
color: #149ded;\
}\
.step .title, .title  {\
color: #f5f5f5;\
}\
.step.active .title {\
color: #149ded;\
font-size: 14px;\
font-weight: 400;\
}\
section {\
border-radius: 12px;\
box-shadow: rgb(0 0 0 / 10%) 0px 0px 5px;\
background-color: #1e293b;\
}\
p , h3, h2, label, .markdown-instructions li , .markdown-instructions p,.line-form .line-form-item > .phone-input,\
.line-form .line-form-item > input{\
color : #f5f5f5 !important;\
font-size : 14px;\
}\
.document-examples, .upload {\
gap : 10px;\
}\
.upload-payment-item {\
margin : 0px;\
}\
.upload-payment-item .upload-item , .mobile-button{\
border: 1px solid rgba(203, 213, 225, 0.12);\
border-radius: 7px;\
box-shadow: rgb(0 0 0 / 10%) 0px 0px 5px;\
}\
.mobile-button h3{\
color : #149ded !important;\
}\
button.submit,\
button[type='submit'] {\
border-radius: 12px;\
background-color: transparent;\
background-image: none;\
color: #149ded;\
border: 1px solid #149ded;\
}\
button:active:not(:disabled):not(.disabled),\
button:hover:not(:disabled):not(.disabled):not(:active) {\
box-shadow: none;\
}\
button.submit:active:not(:disabled),\
button.submit:hover:not(:disabled):not(.disabled):not(:active),\
button[type='submit']:active:not(:disabled),\
button[type='submit']:hover:not(:disabled):not(.disabled):not(:active) {\
background-image: none;\
}\
button {\
border-radius: 12px;\
background-color: transparent;\
font-weight: 600;\
text-align: center;\
color: #149ded;\
border: 1px solid #149ded;\
}\
.line-form .line-form-item > span {\
border-bottom: none;\
}\
button.submit .arrow, button[type=submit] .arrow {\
margin-right: 0;\
margin-left: 5px;\
}\
button .arrow {\
margin-right: 5px;\
}\
.upload-item h4.requiredDoc:after {\
color: #149ded;\
}\
.popup {\
background: #1e293b !important;\
}\
.popup .message-content p {\
color: #f5f5f5 !important;\
}\
.step.pending .bullet {\
background-color: #f5f5f5;\
background-image: none;\
border-color: #f5f5f5;\
}\
.step.pending .line , .step.active .line, .step.success .line{\
background-color: #149ded;\
}\
.step.success .bullet {\
background-color: #149ded;\
border-color: #f5f5f5;\
}\
.error-message.warn {\
background-color: #0f172a;\
}\
.radio-item input:disabled~.checkmark:after {\
background-color: #149ded;\
}\
.document-status {\
background-color: transparent !important;\
}\
"
export const kycStyleDay =
    ".step.active .line, .step.active .bullet:before, .radio-item .checkmark:after, .step.active.pending .bullet:before {\
    background-color: #149ded;\
}\
.accent {\
    color: #149ded;\
}\
.step .title, .title  {\
    color: #0f172a;\
}\
.step.active .title {\
    color: #149ded;\
    font-size: 14px;\
    font-weight: 400;\
}\
section {\
    border-radius: 12px;\
    box-shadow: rgb(0 0 0 / 10%) 0px 0px 5px;\
    background-color: transparent;\
}\
p , h3, h2, label, .markdown-instructions li , .markdown-instructions p,.line-form .line-form-item > .phone-input,\
.line-form .line-form-item > input{\
    color : #0f172a !important;\
    font-size : 14px;\
}\
.document-examples, .upload {\
    gap : 10px;\
}\
.upload-payment-item {\
    margin : 0px;\
}\
.upload-payment-item .upload-item , .mobile-button{\
    border: 1px solid rgba(203, 213, 225, 0.12);\
    border-radius: 7px;\
    box-shadow: rgb(0 0 0 / 10%) 0px 0px 5px;\
}\
 .mobile-button h3{\
    color : #149ded !important;\
 }\
 button.submit,\
button[type='submit'] {\
    border-radius: 12px;\
    background-color: transparent;\
    background-image: none;\
    color: #149ded;\
    border: 1px solid #149ded;\
}\
button:active:not(:disabled):not(.disabled),\
button:hover:not(:disabled):not(.disabled):not(:active) {\
    box-shadow: none;\
}\
button.submit:active:not(:disabled),\
button.submit:hover:not(:disabled):not(.disabled):not(:active),\
button[type='submit']:active:not(:disabled),\
button[type='submit']:hover:not(:disabled):not(.disabled):not(:active) {\
     background-image: none;\
}\
button {\
    border-radius: 12px;\
    background-color: transparent;\
    font-weight: 600;\
    text-align: center;\
    color: #149ded;\
    border: 1px solid #149ded;\
}\
.line-form .line-form-item > span {\
    border-bottom: none;\
}\
button.submit .arrow, button[type=submit] .arrow {\
    margin-right: 0;\
    margin-left: 5px;\
}\
button .arrow {\
    margin-right: 5px;\
}\
.upload-item h4.requiredDoc:after {\
    color: #149ded;\
}\
.popup {\
    background: #e2e8f0 !important;\
}\
.popup .message-content p {\
    color: #0f172a !important;\
}\
.step.pending .bullet {\
    background-color: #0f172a;\
    background-image: none;\
    border-color: #0f172a;\
}\
.step.pending .line , .step.active .line, .step.success .line{\
    background-color: #149ded;\
}\
.step.success .bullet {\
    background-color: #149ded;\
    border-color: #0f172a;\
}\
.error-message.warn {\
    background-color: transparent;\
}\
.radio-item input:disabled~.checkmark:after {\
  background-color: #149ded;\
}\
.document-status {\
    background-color: transparent !important;\
}\
"
