import React from 'react';
import ReactDOM from 'react-dom';
import {Link, HashRouter, Switch, Route, Redirect} from 'react-router-dom';
import {userService} from './services';
import {createHashHistory} from 'history';
import BigCalendar from 'react-big-calendar';
import moment from 'moment';
import {NavLink} from 'react-router-dom';

BigCalendar.setLocalizer(BigCalendar.momentLocalizer(moment))

export const history = createHashHistory();

let regPress = false;
let userid = null;
let admin = false;
let eventID = null;
let viewid = null;
let redid = null;
let rolelistID = null;
let inactive = '';

class LoginPage extends React.Component {
  constructor() {
    super();
    this.userisloggedin;
  }
  render() {
    return (<div>
      <div className="login-body">
        <div className="container">
          <div className="login-wrap">
            <div>
              <div className="login-logo">
                <img className="login-logo-img" src="rodekors-01.png" alt="Logo"/>
              </div>
              <form>
                <div className="form-group">
                  <label className="login-text">Epost:</label>
                  <input type="text" className="form-control" id="usr" ref='inpUser'/>
                </div>
                <div className="form-group">
                  <label className="login-text">Passord:</label>
                  <input type="password" className="form-control" id="pwd" ref='inpPassword'/>
                </div>
              </form>
              <div className="login-grid">
                <div className="login-links-left">
                  <NavLink to='/forgotPassword' className="nav-link">
                    Glemt passord?
                  </NavLink>
                  <NavLink to='/register' className="nav-link">
                    Registrere ny bruker?
                  </NavLink>
                  <div ref='loginOutput'></div>
                </div>
                <div>
                  <button id="login-button" type="button" className="btn btn-danger" ref='btnLogin'>Logg inn</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>);
  }
  componentDidMount() {
    this.refs.btnLogin.onclick = () => {
      let inpUser = this.refs.inpUser.value;
      let inpPassword = this.refs.inpPassword.value;
      let email = this.refs.inpUser.value;
      userService.emptystorage();
      userService.getThisUser(email, (result) => {
        let inactive = result.inactive;
        userService.emptystorage();
        userService.checkIfUserIsInactive(email, inactive, (result) => {
          if (inactive == 1) {
            this.refs.loginOutput.innerText = 'Brukeren er ikke aktivert, kontakt administator';
            userid = null;
            userService.emptystorage();
          }
        })
      })
      userService.loginUser(inpUser, inpPassword, (result) => {
        if (result != undefined) {
          this.userisloggedin = userService.browseruser()
          userid = this.userisloggedin.userID;
          history.push('/homepage');
        } else {
          this.refs.loginOutput.innerText = 'Feil brukernavn eller passord.';
          userService.emptystorage();
          this.forceUpdate();
        }
      })
    }
    this.refs.inpPassword.onkeyup = (event) => {
      event.preventDefault();
      if(event.keyCode === 13){
        this.refs.btnLogin.click();
      }
    };
  }
}

class ForgotPassword extends React.Component {
  render() {
    return (<div>

      <div className="login-body">

        <div className="container">
          <div className="login-wrap">

            <div>
              <div className="login-logo">
                <img className="login-logo-img" src="rodekors-01.png" alt="Logo"/>
              </div>
              <p>Ved glemt passord sender du inn eposten din og du vil få tilsendt videre informasjon på mail.</p>
              <form>
                <div className="form-group">
                  <label htmlFor="usr">Epost:</label>
                  <input type="text" className="form-control" id="usr" ref='inpMail'/>
                </div>
              </form>
              <div className="login-grid">
                <div className="login-links">
                  <NavLink  to='loginPage'>Logg inn?</NavLink>
                  <br/>
                  <NavLink  to="register">Registrer ny bruker?</NavLink>
                </div>
                <div>
                  <button id="login-button" type="button" className="btn btn-danger" ref='sendPass'>Send inn</button>
                </div>
                <div>
                  <span ref="tilbakemelding"></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>)
  }
  componentDidMount() {

    this.refs.sendPass.onclick = () => {
      'use strict';
      const nodemailer = require('nodemailer');

      // Generate test SMTP service account from ethereal.email
      // Only needed if you don't have a real mail account for testing
      nodemailer.createTestAccount((err, account) => {
        // create reusable transporter object using the default SMTP transport
        let transporter = nodemailer.createTransport({
          host: 'smtp.gmail.com', port: 587, secure: false, // true for 465, false for other ports
          auth: {
            user: 'rodekorstest123@gmail.com', // generated ethereal user
            pass: 'rodekors11' // generated ethereal password
          }
        });
        let email = this.refs.inpMail.value;
        let password = Math.random().toString(36).slice(-8);
        userService.getThisUser(email, (result) => {
          userService.updateUserPassword(password, email, (result) => {})
          if (result != undefined) {
            // setup email data with unicode symbols
            let mailOptions = {
              from: '"Rodekors" <rodekorstest123@gmail.com>', // sender address
              to: result.email, // list of receivers
              subject: 'Glemt passord - rodekors', // Subject line
              text: 'Nytt password', // plain text body
              html: '<b>Du har bedt om nytt passord til brukeren </b>' + result.firstname + "<br>" + "Ditt nye passord er " + password, // html body
            };

            // send mail with defined transport object
            transporter.sendMail(mailOptions, (error, info) => {
              if (error) {
                return console.log(error);
              }
              this.refs.tilbakemelding.innerText = 'Mailen er sendt, sjekk eposten din';
            });
          } else {
            this.refs.tilbakemelding.innerText = 'Mailen finnes ikke i vårt register';
          }
        });
      });
    }
  }
}

class Register extends React.Component {
  render() {
    return (<div className="login-body">

      <div className="container">
        <div className="login-wrap-reg">
          <div>
            <div className="login-logo">
              <img className="login-logo-img" src="rodekors-01.png" alt="Logo"/>
            </div>
            <form>
              <div className="login-grid-inp">
                <div className="form-group">
                  <div className="row">
                  <div className="col">
                  <label className="login-text">Fornavn:</label>
                  <input type="text" className="form-control" ref='regFirstName'/>
                </div>
                <div className="col">
                    <label className="login-text">Etternavn:</label>
                    <input type="text" className="form-control" ref='regLastName'/>
                  </div>
                </div>
                  </div>

                  <div className="form-group login-form">
                    <div className="row">
                    <div className="col">
                <label className="login-text">Adresse:</label>
                  <input type="text" className="form-control" ref='regAddress'/>
                </div>
                <div className="col">
                    <label className="login-text">Telefon:</label>
                    <input type="text" className="form-control" ref='regPhone'/>
                  </div>
                </div>
                  </div>

                  <div className="form-group login-form">
                    <div className="row">
                    <div className="col">
                <label className="login-text">By:</label>
                  <input type="text" className="form-control" ref='regCity'/>
                </div>
                <div className="col">
                    <label className="login-text">Postnr:</label>
                    <input type="number" className="form-control" ref='regZip'/>
                  </div>
                </div>
                  </div>

                  <div className="form-group login-form">
                    <div className="row">
                    <div className="col">
                <label className="login-text">Epost:</label>
                  <input type="email" className="form-control" ref='regEmail'/>
                </div>
                <div className="col">
                    <label className="login-text">Alder:</label>
                    <input type="number" className="form-control" ref='regAge'/>
                  </div>
                </div>
                  </div>

                  <div className="form-group login-form">
                    <div className="row">
                      <div className="col">
                <label className="login-text">Passord:</label>
                  <input type="password" className="form-control" ref='regPassword'/>
                </div>
                <div className="col">
                    <label className="login-text">Bekreft passord:</label>
                    <input type="password" className="form-control" ref='repeatregPassword'/>
                  </div>
                  </div>
                </div>

              </div>
            </form>
            <div className="login-grid">
              <div className="login-links">
                <NavLink  to='/loginPage'>Logg inn?</NavLink>
                <br />
                <NavLink  to='/forgotpassword'>Glemt passord?</NavLink>
              </div>
              <div>
                <span ref="feilmelding"></span>
                <br/>
                <div className="login-reg-btn">
                  <button id='login-button' type="button" className="btn btn-danger" ref='btnSendReg'>Registrer</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>)
  } //bør man heller ha en form-action og knappen inne i formen?
  componentDidMount() {

    this.refs.btnSendReg.onclick = () => {
      let firstname = this.refs.regFirstName.value;
      let lastname = this.refs.regLastName.value;
      let address = this.refs.regAddress.value;
      let email = this.refs.regEmail.value;
      let password = this.refs.regPassword.value;
      let city = this.refs.regCity.value;
      let zip = this.refs.regZip.value;
      let phone = this.refs.regPhone.value;
      let age = this.refs.regAge.value;

      if (!firstname && !lastname && !address && !phone && !city && !zip && !email && !age && !password) {
        this.refs.feilmelding.innerText = 'Du må fylle ut skjemaet';
      } else if (!firstname) {
        this.refs.feilmelding.innerText = 'Du må skrive inn et fornavn';
      } else if (!lastname) {
        this.refs.feilmelding.innerText = 'Du må skrive inn et etternavn';
      } else if (!address) {
        this.refs.feilmelding.innerText = 'Du må skrive inn en adresse';
      } else if (!phone) {
        this.refs.feilmelding.innerText = 'Du må skrive inn et telefonnummer';
      } else if (!city) {
        this.refs.feilmelding.innerText = 'Du må skrive inn en by';
      } else if (!zip) {
        this.refs.feilmelding.innerText = 'Du må skrive et gyldig postnr';
      } else if (!email) {
        this.refs.feilmelding.innerText = 'Du må skrive inn en e-postadresse';
      } else if (!age) {
        this.refs.feilmelding.innerText = 'Du må skrive inn din alder';
      } else if (!password) {
        this.refs.feilmelding.innerText = 'Du må skrive inn et passord';
      } else if (this.refs.repeatregPassword.value != this.refs.regPassword.value) {
        this.refs.feilmelding.innerText = 'Passordene er ikke like';
      } else {
        userService.addUser(firstname, lastname, address, email, password, city, zip, phone, age, (result) => {
          alert('Brukeren er opprettet');
          history.push('/loginPage/');
          this.forceUpdate(); //Ikke bruke forceUpdate
        })
      }
      // alert('Informasjonen er ugyldig'); lag noen if-error-sak
    }
  }
}

class Navbar extends React.Component {
  constructor() {
    super();
    this.userisloggedin
  }
  render() {
    this.userisloggedin = userService.browseruser();
    if (this.userisloggedin && this.userisloggedin.admin == 1) {
      if (this.userisloggedin.admin == 1) {
        return (<div>
					<nav className="navbar navbar-expand-lg navbar-dark bg-dark">
					  <div className="container-fluid">
					    <div className="navbar-header">
					      <img className="logo" src="rodekorsw-01.png" alt="Røde Kors Sanitetsvakt"/>
					    </div>
					    <ul className="nav navbar-nav">
					      <li>
									<NavLink  to='/homepage' className="nav-item nav-link" >Aktuelt
								</NavLink></li>
							<li><NavLink  to='/calendar' className="nav-item nav-link">Kalender</NavLink></li>
					      <li><NavLink  to='/events'  className="nav-item nav-link">
									Arrangementer
								</NavLink></li>
								<li><NavLink  to='/contact' className="nav-item nav-link">Om oss</NavLink></li>
							<li><NavLink  to='/profile'  className="nav-item nav-link">
								Profil
							</NavLink></li>
            <li><NavLink  to='/search' className="nav-item nav-link">Medlemmer</NavLink></li>
							<li><NavLink  to='/admin' className="nav-item nav-link">Administrasjon</NavLink></li>
					    </ul>
					    <ul className="nav navbar-nav navbar-right">
								<li>
                  <NavLink to='/loggut' className="nav-item nav-link" onClick={() => {
                      userService.emptystorage();
                      history.push('/loginPage/')
                    }}>
                    &#10006; Logg ut
                  </NavLink>
                </li>
					    </ul>
					  </div>
					</nav>
        </div>);
      }
    } else if (this.userisloggedin) {
      return (<div>
				<nav className="navbar navbar-expand-lg navbar-dark bg-dark">
					<div className="container-fluid">
						<div className="navbar-header">
							<img className="logo" src="rodekorsw-01.png" alt="Røde Kors Sanitetsvakt"/>
						</div>
						<ul className="nav navbar-nav">
							<li>
								<NavLink  to='/homepage' className="nav-item nav-link" >Aktuelt
							</NavLink></li>
						<li><NavLink  to='/calendar' className="nav-item nav-link">Kalender</NavLink></li>
							<li><NavLink  to='/events'  className="nav-item nav-link">
								Arrangementer
							</NavLink></li>
							<li><NavLink  to='/contact' className="nav-item nav-link">Om oss</NavLink></li>
						<li><NavLink  to='/profile'  className="nav-item nav-link">
							Profil
						</NavLink></li>
						<li><NavLink  to='/search' className="nav-item nav-link">Brukersøk</NavLink></li>
						</ul>
						<ul className="nav navbar-nav navbar-right">
							<li>
								<NavLink to='/loggut' className="nav-item nav-link" onClick={() => {
										userService.emptystorage();
										history.push('/loginPage/')
									}}>
									&#10006; Logg ut
								</NavLink>
							</li>
						</ul>
					</div>
				</nav>
			</div>

			)
    } else {
      return null;
    }
  }
  componentDidMount() {
    this.userisloggedin = userService.browseruser();
  }
}

class Profile extends React.Component {
  constructor() {
    super();
    this.userisloggedin
  }

  render() {
    return (<div className="grid-container">
      <div>

        <div className="profile-events">
          <div className="profile-events-grid">
            <div>
              <h3 className="medium-title">Kommende vakter</h3>
              <div className="profile-events-minor-grid">

                <div ref='upcoming'></div>

              </div>
            </div>
            <div>
              <h3 className="medium-title">Deltatte vakter</h3>
              <div className="profile-events-minor-grid">
                <div>

                  <div ref='earlierevents'></div>

                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="profile-course-registration">
          <h2 className="medium-title">Registrere kurs?</h2>
          <div>
          <div className="profile-course-grid">
          <div className="profile-course-inp">
            <p>Hvilken kompetanse gjelder det?</p>
            <form ref='compForm'>
              <select className="form-control profile-course-file" ref='compSelect'></select>
            </form>
            <label className="btn btn-outline-danger btn-file">
              Velg fil
            <input type='file' ref='sendInFile' hidden/>
            </label>
            <br/>
          <button className="btn btn-outline-success" ref='btnAddComp'>Send inn</button>
          <div ref="message"></div>
          </div>
          <div>
            <b>Din     nåværende kompetanse:</b>
            <div ref='compOutput'></div>
          </div>
          </div>
          </div>
        </div>
      </div>

      <div>
        <div>
          <div className="profile-bg">
            <h3 className="medium-title">Personalia</h3>
            <img className="profile-picture" src="profilepicture.jpg" alt=""/>
            <p className="profile-text" ref='userName'></p>
            <p className="profile-text" ref='userPoints'>Vaktpoeng:</p>
            <p className="profile-text" ref='userAge'>Alder:</p>
            <p className="profile-text" ref='userAddress'>Adresse:</p>
            <p className="profile-text" ref='userZip'>Postnr:</p>
            <p className="profile-text" ref='userPhone'>Telefon:</p>
            <p className="profile-text" ref='userEmail'>Epost:</p>
            <p className="profile-text" ref='passive'></p>
          <button className="btn btn-outline-danger" onClick={() => {
                history.push('/editprofile/'),
                this.forceUpdate()
              }}>Rediger</button>
          </div>
        </div>

        <div>
          <div className="profile-deactivate-bg">
            <h3 className="medium-title">Deaktivere profil?</h3>
          <p className="profile-deactivate-text">Ønsker du å deaktivere din profil kan du klikke på knappen under. Profilen din vil da bli deaktivert og du må kontakte administrator for å aktivere den igjen.</p>
          <div className="profile-deactive-btn">
            <button className="btn btn-outline-danger" type="button" ref='btnDeactivate'>Ja, jeg ønsker å deaktivere min profil</button>
          </div>
          </div>
        </div>
      </div>
    </div>);
  }
  componentDidMount() {

    this.userisloggedin = userService.browseruser();
    userid = this.userisloggedin.userID;
    let str;
    let string;
    let array;
    let stri;
    userService.checkifPassive(userid, (result) => {
      if (result != undefined) {

        this.refs.passive.innerText = result.date_End;

        str = result.date_End;
        if (str) {
          string = str.toString();
          array = string.split(" ");
          this.refs.passive.innerText = "Du er fortsatt passiv til " + array[2] + " " + array[1] + " " + array[3];
        }
      }
    })

    let compid = 0;
    userService.getCompetences((result) => {
      for (let comp of result) {
        let compSel = document.createElement('OPTION');
        let compTitle = document.createTextNode(comp.title);

        compSel.appendChild(compTitle);
        this.refs.compSelect.appendChild(compSel);
      }
    })
    const active = 1;
    this.refs.btnAddComp.onclick = () => {
      let title = this.refs.compSelect.value;
      let finished = '2018-01-01';
			let fileUpload = this.refs.sendInFile.value;
      this.refs.message.innerText = "Kurset er sendt inn for godkjenning";
      userService.getCompetence(title, (result) => {
        compid = result.compID;
        userService.regCompetence(userid, compid, fileUpload, finished, active, (result) => {
          this.forceUpdate();
        })
      })
      this.refs.btnAddComp.disabled = true;
      // Skriv en tekst her om at det er sendt til godkjenning
    }
    userService.getUserComp(userid, (result) => {
      for (let usercomp of result) {
        this.refs.compOutput.innerText += usercomp.title + '\n';
      }
    })

    userService.getEarlierUserEvents(userid, (result) => {
      for (let event of result) {
        let divEvent = document.createElement('DIV');
        divEvent.className = 'profile-events-minor-grid';

        let btnEvent = document.createElement('BUTTON');
        let btnEventTxt = document.createTextNode('Informasjon');
        let clickedEvent = event.eventID;

        btnEvent.appendChild(btnEventTxt);
        btnEvent.setAttribute('id', event.eventID);

        let titleEvent = document.createElement('span');
        // titleEvent.setAttribute('href', '/#');
        titleEvent.className = "event-title-bi-pages";
        titleEvent.innerText = event.name;

        btnEvent.onclick = () => {
          sendToEvent(clickedEvent);
        }

        divEvent.appendChild(titleEvent); //Fiks men lag en p for info

        let eventTxt = document.createElement('P');
        eventTxt.className = "profile-event-text";

        str = event.date_start;
        if (str) {
          string = str.toString();
          array = string.split(" ");
          str = array[2] + " " + array[1] + " " + array[3] + " " + array[4];
        }

        eventTxt.innerText += '\n' + 'Lokasjon: ' + event.area + '\n' + 'Kontakttelefon: ' + event.contact_phone + '\n' + 'Startdato: ' + str;

        divEvent.appendChild(eventTxt);

        // divEvent.appendChild(btnEvent);
        this.refs.earlierevents.appendChild(divEvent);
        // divEvent.innerText += '\n'; Fjern dette når du legger til if-en
      }
    })

    userService.getUpcomingEvents(userid, (result) => {
      for (let event of result) {
        let divEvent = document.createElement('DIV');
        divEvent.className = 'aktueltarrangementer';

        let btnEvent = document.createElement('BUTTON');
        let btnEventTxt = document.createTextNode('Informasjon');
        let clickedEvent = event.eventID;

        btnEvent.appendChild(btnEventTxt);
        btnEvent.setAttribute('id', event.eventID);

        let titleEvent = document.createElement('span');
        // titleEvent.setAttribute('href', '/#');
        titleEvent.className = "event-title-bi-pages";
        titleEvent.innerText = event.name;

        btnEvent.onclick = () => {
          sendToEvent(clickedEvent);
        }

        divEvent.appendChild(titleEvent); //Fiks men lag en p for info

        let eventTxt = document.createElement('P');

        stri = event.date_start;
        if (stri) {
          string = stri.toString();
          array = string.split(" ");
          stri = array[2] + " " + array[1] + " " + array[3] + " " + array[4];
        }

        eventTxt.innerText += '\n' + 'Lokasjon: ' + event.area + '\n' + 'Kontakttelefon: ' + event.contact_phone + '\n' + 'Startdato: ' + stri;

        divEvent.appendChild(eventTxt);

        // divEvent.appendChild(btnEvent);
        this.refs.upcoming.appendChild(divEvent);
        // divEvent.innerText += '\n'; Fjern dette når du legger til if-en
      }
    })

    userService.getUser(userid, (result) => {
      this.refs.userName.innerText += result.firstname;
      this.refs.userName.innerText += " " + result.lastname;
      this.refs.userAge.innerText += " " + result.age;
      this.refs.userPhone.innerText += " " + result.phone;
      this.refs.userEmail.innerText += " " + result.email;
      this.refs.userPoints.innerText += " " + result.points;
      this.refs.userZip.innerText += " " + result.zip;
      this.refs.userAddress.innerText += " " + result.address;
    });
    this.refs.btnDeactivate.onclick = () => {
      let r = confirm('Er du sikker på at du vil deaktivere brukeren din?');
      if (r == true) {
        userService.deactivateUser(userid, (result) => {
          userService.emptystorage();
          history.push('/loginPage/')
          // history.push('/loginPage/');
          // this.forceUpdate();
        });
      }
    }
  }
}

class EditOtherProfile extends React.Component {
  constructor() {
    super();
    this.userisloggedin
  }
  render() {
    return (<div className="grid-container">
      <div>

        <div className="profile-events">
          <div className="profile-events-grid">
            <div>
              <h3 className="medium-title">Kommende vakter</h3>
              <div className="profile-events-minor-grid">

                <div ref='upcoming'></div>

              </div>
            </div>
            <div>
              <h3 className="medium-title">Deltatte vakter</h3>
              <div className="profile-events-minor-grid">
                <div>

                  <div ref='earlierevents'></div>

                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="profile-course-registration">
          <h2 className="medium-title">Registrere kurs?</h2>
          <div>
          <div className="profile-course-grid">
          <div className="profile-course-inp">
            <p>Hvilken kvalifisering gjelder det?</p>
            <form ref='compForm'>
              <select className="form-control profile-course-file" ref='compSelect'></select>
            </form>
            <label className="btn btn-outline-danger btn-file">
              Velg fil
            <input type='file' ref='sendInFile' hidden/>
            </label>
            <br/>
          <button className="btn btn-outline-success" ref='btnAddComp'>Send inn</button>
          </div>
          <div>
            <b>Brukerens nåværende kvalifiseringer:</b>
            <div ref="message"></div>
            <div ref='compOutput'></div>
          </div>
          </div>
          </div>
        </div>
      </div>

      <div>
        <div>
          <div className="profile-bg">
            <h3 className="medium-title">Personalia</h3>
            <img className="profile-picture" src="profilepicture.jpg" alt=""/>
            <p className="profile-text" ref='medlemsnummer'>Brukerid:</p>
            <p className="profile-text" ref='userName'></p>
            <p className="profile-text" ref='userPoints'>Vaktpoeng:</p>
            <p className="profile-text" ref='userAge'>Alder:</p>
            <p className="profile-text" ref='userAddress'>Adresse:</p>
            <p className="profile-text" ref='userZip'>Postnr:</p>
            <p className="profile-text" ref='userPhone'>Telefon:</p>
            <p className="profile-text" ref='userEmail'>Epost:</p>
            <p className="profile-text" ref='passive'></p>
            <button className="btn btn-outline-danger"  onClick = {() => {
						history.push('/editprofile/'),
						this.forceUpdate()}}>Rediger</button>
            <button className="btn btn-outline-danger"  ref="makeadmin">Gjør om til admin</button>
            <p className="profile-text" ref="utskrift"></p>
            <p className="profile-text" ref="passive"></p>
          </div>
        </div>

        <div>
          <div className="profile-deactivate-bg">
            <h3 className="medium-title" ref="deactive">Deaktivere profil?</h3>
            <h3 className="medium-title" ref="reactivate">Aktiver profil?</h3>
          <p className="profile-deactivate-text" ref="deactive2">Deaktiver brukerens profil her:</p>
        <p className="profile-deactivate-text" ref="reactivate2">Aktiver brukerens profil her:</p><br />
            <button className="btn btn-outline-danger" type="button" ref='btnDeactivate'>Ja, jeg ønsker å deaktivere denne profilen</button>
          <button  className="btn btn-outline-success" type="button" ref='btnActivate'>Ja, jeg ønsker å aktivere denne profilen</button>
          </div>
        </div>

      </div>
    </div>);
  }

  componentDidMount() {
    this.userisloggedin = userService.browseruser();
    userid = this.userisloggedin.userID;
    redid = viewid;
    let str;
    let string;
    let array;
    let stri;
    let compid = 0;
    this.refs.reactivate.hidden = true;
    this.refs.reactivate2.hidden = true;
    this.refs.btnActivate.hidden = true;
    userService.getCompetences((result) => {
      for (let comp of result) {
        let compSel = document.createElement('OPTION');
        let compTitle = document.createTextNode(comp.title);

        compSel.appendChild(compTitle);
        this.refs.compSelect.appendChild(compSel);
      }
    })
    this.refs.btnAddComp.onclick = () => {
      let title = this.refs.compSelect.value;
      let finished = '2018-01-01';

      userService.getCompetence(title, (result) => {
        compid = result.compID;
        userService.regCompetence(viewid, compid, finished, (result) => {
          this.forceUpdate();
        })
      })
      // Skriv en tekst her om at det er sendt til godkjenning
    }
    userService.getUserComp(viewid, (result) => {
      for (let usercomp of result) {
        this.refs.compOutput.innerText += usercomp.title + '\n';
      }
    })

    this.refs.makeadmin.onclick = () => {
      this.refs.makeadmin.disabled = true;
      this.refs.utskrift.innerText = 'Brukeren har nå admin egenskaper'
      userService.getUser(viewid, (result) => {
        let admin = 1;
        userService.makeAdmin(admin, viewid, (result) => {})
      })
    }
    userService.getThisUser2(viewid, (result) => {
      if (result.admin == 1) {
        this.refs.makeadmin.hidden = true;
        this.refs.utskrift.innerText = 'Brukeren er en Administrator'
      }
      userService.checkIfAdmin(admin, viewid, (result) => {})
    })

    userService.checkifPassive(viewid, (result) => {
      let str;
      let string;
      let array;
      if (result != undefined) {

        this.refs.passive.innerText = result.date_End;

        str = result.date_End;
        if (str) {
          string = str.toString();
          array = string.split(" ");
          this.refs.passive.innerText = "Brukeren er passiv til " + array[2] + " " + array[1] + " " + array[3];
        }
      }
    })

    userService.getEarlierUserEvents(viewid, (result) => {
      for (let event of result) {
        let divEvent = document.createElement('DIV');
        divEvent.className = 'aktueltarrangementer';

        let btnEvent = document.createElement('BUTTON');
        let btnEventTxt = document.createTextNode('Informasjon');
        let clickedEvent = event.eventID;

        btnEvent.appendChild(btnEventTxt);
        btnEvent.setAttribute('id', event.eventID);

        let titleEvent = document.createElement('span');
        // titleEvent.setAttribute('href', '/#');
        titleEvent.className = "event-title-bi-pages";
        titleEvent.innerText = event.name;

        btnEvent.onclick = () => {
          sendToEvent(clickedEvent);
        }

        divEvent.appendChild(titleEvent); //Fiks men lag en p for info

        let eventTxt = document.createElement('P');

        stri = event.date_start;
        if (stri) {
          string = stri.toString();
          array = string.split(" ");
          stri = array[2] + " " + array[1] + " " + array[3] + " " + array[4];
        }

        eventTxt.innerText += '\n' + 'Lokasjon: ' + event.area + '\n' + 'Kontakttelefon: ' + event.contact_phone + '\n' + 'Startdato: ' + stri;

        divEvent.appendChild(eventTxt);

        // divEvent.appendChild(btnEvent);
        this.refs.earlierevents.appendChild(divEvent);
        // divEvent.innerText += '\n'; Fjern dette når du legger til if-en
      }
    })

    userService.getUpcomingEvents(viewid, (result) => {
      for (let event of result) {
        let divEvent = document.createElement('DIV');
        divEvent.className = 'aktueltarrangementer';

        let btnEvent = document.createElement('BUTTON');
        let btnEventTxt = document.createTextNode('Informasjon');
        let clickedEvent = event.eventID;

        btnEvent.appendChild(btnEventTxt);
        btnEvent.setAttribute('id', event.eventID);

        let titleEvent = document.createElement('span');
        // titleEvent.setAttribute('href', '/#');
        titleEvent.className = "event-title-bi-pages";
        titleEvent.innerText = event.name;

        btnEvent.onclick = () => {
          sendToEvent(clickedEvent);
        }

        divEvent.appendChild(titleEvent); //Fiks men lag en p for info

        let eventTxt = document.createElement('P');

        str = event.date_start;
        if (str) {
          string = str.toString();
          array = string.split(" ");
          str = array[2] + " " + array[1] + " " + array[3] + " " + array[4];
        }
        eventTxt.innerText += '\n' + 'Lokasjon: ' + event.area + '\n' + 'Kontakttelefon: ' + event.contact_phone + '\n' + 'Startdato: ' + str;

        divEvent.appendChild(eventTxt);

        // divEvent.appendChild(btnEvent);
        this.refs.upcoming.appendChild(divEvent);
        // divEvent.innerText += '\n'; Fjern dette når du legger til if-en
      }
    })

    userService.getUser(viewid, (result) => {
      this.refs.medlemsnummer.innerText += result.userID;
      this.refs.userName.innerText += result.firstname;
      this.refs.userName.innerText += " " + result.lastname;
      this.refs.userAge.innerText += " " + result.age;
      this.refs.userPhone.innerText += " " + result.phone;
      this.refs.userEmail.innerText += " " + result.email;
      this.refs.userPoints.innerText += " " + result.points;
      this.refs.userZip.innerText += " " + result.zip;
      this.refs.userAddress.innerText += " " + result.address;
    });
    this.refs.btnDeactivate.onclick = () => {
        userService.deactivateUser(viewid, (result) => {
          this.refs.btnDeactivate.hidden = true;
          this.refs.deactive.hidden = true;
          this.refs.deactive2.hidden = true;
          this.refs.reactivate.hidden = false;
          this.refs.reactivate2.hidden = false;
          this.refs.btnActivate.hidden = false;
          // history.push('/loginPage/');
          // this.forceUpdate();
        });
    }
    this.refs.btnActivate.onclick = () => {
      userService.activateUser(viewid, (result) => {
        this.refs.btnDeactivate.hidden = false;
        this.refs.deactive.hidden = false;
        this.refs.deactive2.hidden = false;
        this.refs.reactivate.hidden = true;
        this.refs.reactivate2.hidden = true;
        this.refs.btnActivate.hidden = true;
      })
    }
  }
}

class EditProfile extends React.Component {
  constructor() {
    super();
    this.userisloggedin
  }
  render() {
    return (<div className="big-container">
      <div className="edit-profile-bg">
        <h1 className="eventmediumtitle">Rediger profil</h1>
        <form>
          <div className="login-grid">
            <div className="form-group">
              <label className="login-text">Fornavn:</label>
              <input type="text" ref='editFirstName' className="form-control"/>
              <label className="login-text">Adresse:</label>
              <input type="text" className="form-control" ref='editAddress'/>
              <label className="login-text">By:</label>
              <input type="text" className="form-control" ref='editCity'/>
              <label className="login-text">Epost:</label>
              <input type="email" className="form-control" ref='editEmail'/>
              <label className="login-text">Passord:</label>
              <input type="password" className="form-control"/>
            </div>
            <div className="form-group">
              <label className="login-text">Etternavn:</label>
              <input type="text" className="form-control" ref='editLastName'/>
              <label className="login-text">Telefon:</label>
              <input type="number" className="form-control" ref='editPhone'/>
              <label className="login-text">Postnr:</label>
              <input type="number" className="form-control" ref='editZip'/>
              <label className="login-text">Alder:</label>
              <input type="number" className="form-control" ref='editAge'/>
              <label className="login-text">Bekreft passord:</label>
              <input type="password" className="form-control" ref='editPassword'/>
            </div>
          </div>
        </form>
        <div className="login-grid">
          <div>
            <button type="button" className="btn btn-outline-danger" onClick={() => {
                history.push('/profile/'),
                this.forceUpdate()
              }}>Tilbake</button>
            </div>
          <div className="edit-profile-btn-right">
            <button type="button" className="btn btn-success" ref='btnSendEdit'>Lagre</button>
          </div>
        </div>
      </div>
    </div>)
  }

  componentWillUnmount() {
    redid = null;
  }

  componentDidMount() {

    this.userisloggedin = userService.browseruser();
    userid = this.userisloggedin.userID;

    userService.getUser(redid ? redid : userid, (result) => {
      this.refs.editFirstName.value = result.firstname;
      this.refs.editLastName.value = result.lastname;
      this.refs.editAddress.value = result.address;
      this.refs.editEmail.value = result.email;
      this.refs.editCity.value = result.city;
      this.refs.editZip.value = result.zip;
      this.refs.editPhone.value = result.phone;
      this.refs.editAge.value = result.age;
      this.refs.editPassword.value = result.password;
    });

    this.refs.btnSendEdit.onclick = () => {
      let a = confirm('Er du sikker på at du vil lagre endringene?');
      if (a == true) {
        let newFirstname = this.refs.editFirstName.value;
        let newLastname = this.refs.editLastName.value;
        let newAddress = this.refs.editAddress.value;
        let newEmail = this.refs.editEmail.value;
        let newPassword = this.refs.editPassword.value;
        let newCity = this.refs.editCity.value;
        let newZip = this.refs.editZip.value;
        let newPhone = this.refs.editPhone.value;
        let newAge = this.refs.editAge.value;

        userService.editUser(redid ? redid : userid, newFirstname, newLastname, newAddress, newEmail, newPassword, newCity, newZip, newPhone, newAge, (result) => {})
        history.push('/profile/');
        this.forceUpdate();
      }
    }
  }
  componentWillUnmount() {
    redid = null;
  }
}

class Competence extends React.Component {
  constructor() {
    super();
    this.userisloggedin;
  }
  render() {
    return (<div>
      <h1>Kompetanse</h1>
      <div>
        <p>Legg til kompetanse:</p>
        <form ref='compForm'>
          <select ref='compSelect'></select>
        </form>
        <button ref='btnAddComp'>Legg til</button>
        <button ref='btnProfile'>Tilbake</button>
        <div ref='compOutput'></div>
      </div>
    </div>)
  }
  componentDidMount() {
    this.userisloggedin = userService.browseruser();
    let compid = 0;

    this.refs.btnProfile.onclick = () => {
      history.push('/profile');
      this.forceUpdate();
    }

    userService.getCompetences((result) => {
      for (let comp of result) {
        let compSel = document.createElement('OPTION');
        let compTitle = document.createTextNode(comp.title);

        compSel.appendChild(compTitle);
        this.refs.compSelect.appendChild(compSel);
      }
    })
    this.refs.btnAddComp.onclick = () => {
      let title = this.refs.compSelect.value;
      let finished = '2018-01-01';

      userService.getCompetence(title, (result) => {
        compid = result.compID;
        userService.regCompetence(redid, compid, finished, (result) => {
          history.push('/EditOtherProfile');
        })
      })
      this.forceUpdate(); // Skriv en tekst her om at det er sendt til godkjenning
    }
    userService.getUserComp(
      redid
      ? redid
      : userid,
    (result) => {
      for (let usercomp of result) {
        this.refs.compOutput.innerText += usercomp.title + '\n';
      }
    })
  }
}

class Homepage extends React.Component {
  constructor() {
    super();
    this.userisloggedin;
  }
  render() {
    return (<div>
      <div className="grid-container">
        <div className="main-wrap">
          <h1 className="title">Aktuelle saker</h1>

          <div className="news-left-grid">

            <div className="news-image-grid">
              <div>
                <img className="news-image" src="jemen.jpg" alt=""/>
              </div>
              <div>
                <img className="news-image" src="jemen.jpg" alt=""/>
              </div>
              <div>
                <img className="news-image" src="jemen.jpg" alt=""/>
              </div>
              <div>
                <img className="news-image" src="jemen.jpg" alt=""/>
              </div>
              <div>
                <img className="news-image" src="jemen.jpg" alt=""/>
              </div>
            </div>

            <div className="news-text-grid">
              <div className="news-text">
                <h5>Den humanitære katastrofen i Jemen løses ikke med nødhjelp</h5>
                <p>- Situasjonen i Jemen i dag er dramatisk. Nesten 80 prosent av befolkningen trenger nødhjelp for å klare seg. For hver dag som går uten en løsning på konflikten blir situasjonen verre. Folk dør av sykdommer som kan forhindres, mangel på mat, vann og strøm. Sykdommer som kolera kan forebygges, men i Jemen har det vært over en million tilfeller, fordi krigen har ført til kollaps i helsetilbudet, sier generalsekretær i Røde Kors i Norge Bernt G. Apeland.</p>
              </div>
              <div className="news-text">
                <h5>Den humanitære katastrofen i Jemen løses ikke med nødhjelp</h5>
                <p>- Situasjonen i Jemen i dag er dramatisk. Nesten 80 prosent av befolkningen trenger nødhjelp for å klare seg. For hver dag som går uten en løsning på konflikten blir situasjonen verre. Folk dør av sykdommer som kan forhindres, mangel på mat, vann og strøm. Sykdommer som kolera kan forebygges, men i Jemen har det vært over en million tilfeller, fordi krigen har ført til kollaps i helsetilbudet, sier generalsekretær i Røde Kors i Norge Bernt G. Apeland.</p>
              </div>
              <div className="news-text">
                <h5>Den humanitære katastrofen i Jemen løses ikke med nødhjelp</h5>
                <p>- Situasjonen i Jemen i dag er dramatisk. Nesten 80 prosent av befolkningen trenger nødhjelp for å klare seg. For hver dag som går uten en løsning på konflikten blir situasjonen verre. Folk dør av sykdommer som kan forhindres, mangel på mat, vann og strøm. Sykdommer som kolera kan forebygges, men i Jemen har det vært over en million tilfeller, fordi krigen har ført til kollaps i helsetilbudet, sier generalsekretær i Røde Kors i Norge Bernt G. Apeland.</p>
              </div>
              <div className="news-text">
                <h5>Den humanitære katastrofen i Jemen løses ikke med nødhjelp</h5>
                <p>- Situasjonen i Jemen i dag er dramatisk. Nesten 80 prosent av befolkningen trenger nødhjelp for å klare seg. For hver dag som går uten en løsning på konflikten blir situasjonen verre. Folk dør av sykdommer som kan forhindres, mangel på mat, vann og strøm. Sykdommer som kolera kan forebygges, men i Jemen har det vært over en million tilfeller, fordi krigen har ført til kollaps i helsetilbudet, sier generalsekretær i Røde Kors i Norge Bernt G. Apeland.</p>
              </div>
              <div className="news-text">
                <h5>Den humanitære katastrofen i Jemen løses ikke med nødhjelp</h5>
                <p>- Situasjonen i Jemen i dag er dramatisk. Nesten 80 prosent av befolkningen trenger nødhjelp for å klare seg. For hver dag som går uten en løsning på konflikten blir situasjonen verre. Folk dør av sykdommer som kan forhindres, mangel på mat, vann og strøm. Sykdommer som kolera kan forebygges, men i Jemen har det vært over en million tilfeller, fordi krigen har ført til kollaps i helsetilbudet, sier generalsekretær i Røde Kors i Norge Bernt G. Apeland.</p>
              </div>
            </div>

          </div>

        </div>

        <div>
          <div className="news-right-top" ref='usrDiv'>
            <img className="profile-picture" src="profilepicture.jpg" alt=""/>
          <p className="news-profile-text" ref='usrName'>Per Ole Finsnes</p>
          <p className="-news-profile-text" ref='usrPoints'>Vaktpoeng: 14</p>
          </div>
          <div className="news-right-bottom">
            <h3 className="medium-title">Kommende arrangementer</h3>
            <div className="news-events" ref='upcoming'></div>

          </div>
        </div>
      </div>
    </div>);
  }
  componentDidMount() {
    this.refs.usrDiv.onclick = () => {
      history.push('/profile');
      this.forceUpdate();
    }
    this.userisloggedin = userService.browseruser();
    userid = this.userisloggedin.userID;
    userService.getUser(userid, (result) => {
      this.refs.usrName.innerText = result.firstname + ' ' + result.lastname;
      this.refs.usrPoints.innerText = 'Vaktpoeng: ' + result.points;
    })

    userService.getUpcomingevents((result) => {
      for (let event of result) {
        let divEvent = document.createElement('DIV');
        divEvent.className = 'aktueltarrangementer';

        let btnEvent = document.createElement('BUTTON');
        let btnEventTxt = document.createTextNode('Informasjon');
        let clickedEvent = event.eventID;

        btnEvent.appendChild(btnEventTxt);
        btnEvent.setAttribute('id', event.eventID);

        let titleEvent = document.createElement('span');
        // titleEvent.setAttribute('href', '/#');
        titleEvent.className = "event-title-bi-pages";
        titleEvent.innerText = event.name;

        btnEvent.onclick = () => {
          sendToEvent(clickedEvent);
        }

        divEvent.appendChild(titleEvent); //Fiks men lag en p for info

        let eventTxt = document.createElement('P');
        let str;
        let string;
        let array;
        str = event.date_start;
        if (str) {
          string = str.toString();
          array = string.split(" ");
          str = array[2] + " " + array[1] + " " + array[3] + " " + array[4];
        }

        eventTxt.innerText += '\n' + 'Lokasjon: ' + event.area + '\n' + 'Kontakttelefon: ' + event.contact_phone + '\n' + 'Startdato: ' + str;

        divEvent.appendChild(eventTxt);

        // divEvent.appendChild(btnEvent);
        this.refs.upcoming.appendChild(divEvent);
        // divEvent.innerText += '\n'; Fjern dette når du legger til if-en
      }
    })
  }
}

class Events extends React.Component {
  constructor() {
    super();
    this.userisloggedin;
  }
  render() {

    return (<div className="event-container">
      <div className="event-center-content">
        <h1 className="event-title">Arrangementer</h1>
        <div>
          <button className="btn btn-light event-button" ref='showPreEvents'>Se tidligere arrangement</button>
          <button className="btn btn-light event-button" ref='btnNewEvent'>Legg til arrangement</button>
        </div>
      </div>

      <div className="event-flex" ref='upcoming'></div>
    </div>);

  }
  componentDidMount() {

    this.userisloggedin = userService.browseruser();
    userid = this.userisloggedin.userID;

    if (this.userisloggedin.admin != 1) {
      this.refs.btnNewEvent.hidden = true;
    }

    let str;
    let string;
    let array;
    let stri;
    let btnPressed = false;
    // let thisDate = new Date();

    this.refs.btnNewEvent.onclick = () => {
      history.push('/newEvent/');
      this.forceUpdate();
    }

    this.refs.showPreEvents.onclick = () => {
      if (btnPressed == false) {
        this.refs.upcoming.innerText = '';
        userService.getUpcomingevents((result) => {
          for (let event of result) {
            let divEvent = document.createElement('DIV');
            divEvent.className = 'event-bg';

            let btnEvent = document.createElement('BUTTON');
            let btnEventTxt = document.createTextNode('Mer info');
            let clickedEvent = event.eventID;
            btnEvent.className = "btn btn-outline-danger"

            btnEvent.appendChild(btnEventTxt);
            btnEvent.setAttribute('id', event.eventID);

            let titleEvent = document.createElement('H4');
            titleEvent.className = "eventmediumtitle";
            titleEvent.innerText = event.name;

            btnEvent.onclick = () => {
              sendToEvent(clickedEvent);
            }

            divEvent.appendChild(titleEvent); //Fiks men lag en p for info

            let eventTxt = document.createElement('P');
            eventTxt.className = "event-text";

            str = event.date_start;
            if (str) {
              string = str.toString();
              array = string.split(" ");
              str = array[2] + " " + array[1] + " " + array[3] + " " + array[4];
            }

            eventTxt.innerText += '\n' + 'Lokasjon: ' + event.area + '\n' + 'Kontakttelefon: ' + event.contact_phone + '\n' + 'Startdato: ' + str;

            divEvent.appendChild(eventTxt);

            divEvent.appendChild(btnEvent);
            this.refs.upcoming.appendChild(divEvent);
            // divEvent.innerText += '\n'; Fjern dette når du legger til if-en
          }
          btnPressed = true;
          this.refs.showPreEvents.innerText = 'Se tidligere arrangementer';
        })
      } else {
        this.refs.upcoming.innerText = '';
        userService.getPastEvents((result) => {
          for (let event of result) {
            let divEvent = document.createElement('DIV');
            divEvent.className = 'event-bg';

            let btnEvent = document.createElement('BUTTON');
            let btnEventTxt = document.createTextNode('Mer info');
            let clickedEvent = event.eventID;
            btnEvent.className = "btn btn-outline-danger"

            btnEvent.appendChild(btnEventTxt);
            btnEvent.setAttribute('id', event.eventID);

            let titleEvent = document.createElement('h4');
            titleEvent.className = 'eventmediumtitle';
            titleEvent.innerText = event.name;

            divEvent.appendChild(titleEvent);

            btnEvent.onclick = () => {
              sendToEvent(clickedEvent);
            }

            let eventTxt = document.createElement('P');
            eventTxt.className = 'event-text'

            stri = event.date_start;
            if (stri) {
              string = stri.toString();
              array = string.split(" ");
              stri = array[2] + " " + array[1] + " " + array[3] + " " + array[4];
            }

            eventTxt.innerText += '\n' + 'Lokasjon: ' + event.area + '\n' + 'Kontakttelefon: ' + event.contact_phone + '\n' + 'Startdato: ' + stri;

            divEvent.appendChild(eventTxt);

            divEvent.appendChild(btnEvent);
            this.refs.upcoming.appendChild(divEvent);
            // divEvent.innerText += '\n'; Fjern dette når du legger til if-en
          }
          btnPressed = false;
          this.refs.showPreEvents.innerText = 'Se kommende arrangementer';
        })
      }
    }

    this.refs.showPreEvents.click();

    function sendToEvent(id) {
      eventID = id;
      history.push('/divEvent/');

    }
  }
}

class Contact extends React.Component {
  render() {
    return (<div>
      <div className="big-container">
        <div className="about-bg">
          <h2 className="title">Lokalforeninger i Trondheimsområdet</h2>

          <div className="about-container">
            <div className="about-maps">
              <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1785.8060229100615!2d10.414399016240537!3d63.410782283268!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x466d31c71f115b5d%3A0x5273344a7d7ea94a!2sTrondheim+R%C3%B8de+Kors!5e0!3m2!1sno!2sno!4v1523533302113" width="500" height="300" frameBorder="0" style={{
                  border: 0
                }} allowFullScreen="allowFullScreen"></iframe>
              <div className="abouttext">
                <h3 className="aboutmediumtitle">Trondheim Røde Kors</h3>
                <p className="aboutbreadtext">Med over 1000 frivillige og flere enn 20 aktiviteter er vi til stede for andre mennesker og sårbare grupper i byen vår.</p>
              </div>

              <div>
                <div className="aboutflex">
                  <div className="abouttext2">
                    <h4 className="aboutmediumtitle">Adresse</h4>
                  </div>
                  <div className="abouttext2">
                    <h4 className="aboutmediumtitle">Telefon</h4>
                  </div>
                  <div className="abouttext2">
                    <h4 className="aboutmediumtitle">Epost</h4>
                  </div>
                </div>
                <div className="aboutflex">
                  <div className="abouttext2">
                    <div className="abouttext3">
                      <p>Nardoveien 4 B 7032 Trondheim</p>
                    </div>
                  </div>
                  <div className="abouttext2">
                    <div className="abouttext3">
                      <p>73 94 93 00</p>
                    </div>
                  </div>
                  <div className="abouttext2">
                    <div className="abouttext3">
                      <p>post@trondheim-redcross.no</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="about-maps">
              <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1785.4153630771596!2d10.774810216042496!3d63.41705568381125!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x466d3c5135aa3aef%3A0xf02afa00572e3186!2sHesttr%C3%B8a+1%2C+7550+Hommelvik!5e0!3m2!1sno!2sno!4v1523533990024" width="500" height="300" frameBorder="0" style={{
                  border: 0
                }} allowFullScreen="allowFullScreen"></iframe>
              <div className="abouttext">
                <h3 className="aboutmediumtitle">Malvik Røde Kors</h3>
                <p className="aboutbreadtext">I over 73 år har Malvik Røde Kors og våre frivillige stilt opp for å hjelpe til i lokalsamfunnet. Det tenker vi å fortsette med, og da trenger vi flere frivillige.</p>
              </div>

              <div>
                <div className="aboutflex">
                  <div className="abouttext2">
                    <h4 className="aboutmediumtitle">Adresse</h4>
                  </div>
                  <div className="abouttext2">
                    <h4 className="aboutmediumtitle">Telefon</h4>
                  </div>
                  <div className="abouttext2">
                    <h4 className="aboutmediumtitle">Epost</h4>
                  </div>
                </div>
                <div className="aboutflex">
                  <div className="abouttext2">
                    <div className="abouttext3">
                      <p>Hesttrøa 1
                        <br/>
                        7550 Hommelvik</p>
                    </div>
                  </div>
                  <div className="abouttext2">
                    <div className="abouttext3">
                      <p>73 94 93 45</p>
                    </div>
                  </div>
                  <div className="abouttext2">
                    <div className="abouttext3">
                      <p>malvik@strk-redcross.no</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>);
  }
}

class Vaktliste extends React.Component {
  constructor() {
    super();
    this.state = {
      users: '',
      userhasevent: ''
    }
    this.update = "";
    this.hasevent = "";
  }
  render() {
    return (<div className="big-container">
		<div className="main-wrap">

      <h1 className="title">
        <p ref="title" />
      </h1>
			<div className="int-grid">

				<div>
	      <h3 className="medium-title">
	        Påmeldte medlemmer
	      </h3>
	      <ul>
	        {
	          this.state.userhasevent
	            ? this.state.userhasevent
	            : 'Ingen påmeldte'
	        }
	      </ul>
				</div>

				<div>
	      <h3 className="medium-title">
	        Interesserte medlemmer
	      </h3>
	      <ul>
	        {
	          this.state.users
	            ? this.state.users
	            : 'Ingen interesserte'
	        }
	      </ul>
				</div>
			</div>
			<div className="int-btn">
				<button className="btn btn-outline-danger" ref="backButton">Tilbake</button>
			</div>
			</div>
    </div>)
  }

  deleteuser(userid) {
    userService.deleteInterested(eventID, userid, (result) => {
      userService.getInterested(eventID, userid, (result) => {
        this.update = result;
        this.jodajoda();

      })
    })
  }

  deletefromvakt(userid) {
    userService.deleteFromArr(eventID, userid, (result) => {
      userService.getUserHasEvent(userid, eventID, (result) => {
        this.hasevent = result;
        this.hentbrukere();
      })
    })
  }

  addUser(userid) {
    userService.addUserHasEvent(userid, eventID, (result) => {
      userService.getUserHasEvent(userid, eventID, (result) => {
        this.hasevent = result;
        this.hentbrukere();
      })
    })
  }

  hentbrukere() {
    var pameldte = [];

    for (let user of this.hasevent) {
      pameldte.push(<li key={user.userID}>
        <Link onClick={() => {
            viewid = user.userID;
          }} to={'/editotherprofile/'}>
          {user.firstname + " " + user.lastname + " "}
        </Link>
        <button className="btn btn-outline-danger" onClick={() => {
            this.deletefromvakt(user.userID)
          }}>Meld av</button>
      </li>)
    }

    this.setState({userhasevent: pameldte})
  }

  jodajoda() {
    var int = [];

    for (let user of this.update) {
      int.push(<li key={user.userID}>
        {user.firstname + ", " + user.points + " vaktpoeng. "}
        <button className="btn btn-outline-success" onClick={() => {
            this.addUser(user.userID)
            this.deleteuser(user.userID)
          }}>Aksepter</button>
				<button className="btn btn-outline-danger" onClick= {() => {
				this.deleteuser(user.userID)
			}}>Avslå</button>
      </li>)
    }
    this.setState({users: int})
  }

  componentDidMount() {
    userService.getInterested(eventID, userid, (result) => {
      this.update = result;
      this.jodajoda();
    })
    userService.getUserHasEvent(userid, eventID, (result) => {
      this.hasevent = result;
      this.hentbrukere();
    })
    userService.getDivEvent(eventID,(result) => {
      this.refs.title.innerText = result.name;
    })
    this.refs.backButton.onclick = () => {
      history.push('/divEvent');
    }
  }
}

class DivEvent extends React.Component {
	constructor() {
		super();
		this.userisloggedin;
	}
	render() {
		return(
			<div className="big-container">
			<div className="about-bg">
			<h1 className="title" ref='eventName'></h1>
			<div className="event-div-grid">
				<div className="event-div-p">
					<p>Startdato:</p>
					<p>Sluttdato:</p>
					<p>Møtested:</p>
					<p>Vaktansvarlig:</p>
					<p>Kontaktinfo:</p>
					<p>Rolleliste:</p>
				</div>
				<div className="event-div-ref">
					<p ref='eventstartdate'></p>
					<p ref='eventsluttdate'></p>
					<p ref='eventmøtested'></p>
					<p ref='shiftManager'></p>
					<p ref='kontaktinfo'></p>
					<p ref='rolelist'></p>
				</div>
			</div>
			<div className="event-div-descrip">
				<p className="event-div-descrip-p">Beskrivelse:</p>
				<p ref='eventinfo'></p>
				<div className="event-div-grid-btn">
					<div className="event-div-grid-btn-left">
						<button className="btn btn-outline-danger" ref="goback">Tilbake</button>
						<button className="btn btn-outline-danger" ref='editArr'>Rediger</button>
					</div>
					<div className="event-div-grid-btn-right">
						<button className="btn btn-success" ref='Interested'>Meld interesse</button>
						<button className="btn btn-danger" ref='notInterested'>Avmeld interesse</button>
						<button className="btn btn-outline-danger" ref='checkinterested'>Se interesserte</button><br />
						<p className="event-div-grid-btn-left" ref="hasevent"></p>
					</div>
				</div>

			</div>
			</div>
			</div>
		)
	}

	componentDidMount() {
		this.userisloggedin = userService.browseruser();
		userid = this.userisloggedin.userID;

    this.refs.goback.onclick = () => {
      history.push('/events');
    }
		this.refs.notInterested.hidden = true;
		if (this.userisloggedin.admin !== 1) {
			this.refs.checkinterested.hidden = true;
			this.refs.editArr.hidden = true;
		}
		let str; let string; let array;

		userService.getDivEvent(eventID,(result) => {
					this.refs.eventName.innerText = result.name;
					this.refs.eventstartdate.innerText = result.date_start;
					this.refs.eventsluttdate.innerText = result.date_end;
					this.refs.eventinfo.innerText = result.description;
					this.refs.eventmøtested.innerText = result.area;
					this.refs.kontaktinfo.innerText = result.contact_phone;
					this.refs.shiftManager.innerText = result.shiftManager;

					let rolelistid = result.rolelist_roleID;

    userService.getRolelistName(rolelistid, (result) => {
         this.refs.rolelist.innerText = result.name;
      })

					str = result.date_start;
          if (str) {
            string = str.toString();
            array = string.split(" ");
            this.refs.eventstartdate.innerText = array[2]+" "+array[1]+" "+array[3]+" "+array[4];
          }
					str = result.date_end;
					if (str) {
						string = str.toString();
						array = string.split(" ");
						this.refs.eventsluttdate.innerText = array[2]+" "+array[1]+" "+array[3] + " " + array[4];
					}
					userService.checkifUserHasEvent(eventID, userid, (result) => {
						if (result != undefined) {
							this.refs.Interested.hidden = true;
							this.refs.notInterested.hidden = true;
							this.refs.hasevent.innerText = "Du er meldt på dette arrangementet, kontakt en administrator for å melde deg av";
						}
					})

					this.refs.Interested.onclick = () => {
					userService.addInterested(eventID, userid, (result) => {
						this.refs.hasevent.innerText = 'Du har meldt deg interresert';
						this.refs.Interested.hidden = true;
						this.refs.notInterested.hidden = false;
						this.forceUpdate();
					})
			}

			userService.checkifInterested(eventID, userid, (result) => {
				if (result != undefined) {
					this.refs.Interested.hidden = true;
					this.refs.notInterested.hidden = false;
					this.refs.hasevent.innerText = 'Du er meldt interresert på arrangementet';
					this.forceUpdate();
				}
			})

				this.refs.notInterested.onclick = () => {
				userService.deleteInterested(eventID, userid, (result) => {
					this.refs.notInterested.hidden = true;
					this.refs.Interested.hidden = false;
					this.refs.hasevent.innerText = 'Du er ikke lenger interresert';
				})
			}
		})

		this.refs.editArr.onclick = () => {
			history.push('/editevent/');
			this.forceUpdate();
		}

		this.refs.checkinterested.onclick = () => {
			history.push('/vaktliste/');
		}
	}
}

class EditEvent extends React.Component {
  render() {
    return (
			<div className="big-container">
	      <div className="new-event-bg">
	        <h1 className="eventmediumtitle">Redigere arrangement</h1>
	        <form>
	          <div className="login-grid">
	            <div className="form-group">
	              <label className="login-text">Tittel:</label>
	              <input type="text" className="form-control" ref='editArrName'/>
	              <label className="login-text">Startdato:</label>
	              <input type="datetime-local" className="form-control" ref='editStartDato'/>
	              <label className="login-text">Vaktansvarlig:</label>
	              <input type="text" className="form-control" ref='editShitManager'/>
	              <label className="login-text">Vaktlag:</label>
	              <select className="form-control" id="exampleFormControlSelect1" ref='editRoles'></select>
	            </div>
	            <div className="form-group">
	              <label className="login-text">Vaktpoeng:</label>
	              <input type="number" className="form-control" ref='editPoints'/>
	              <label className="login-text">Sluttdato:</label>
	              <input type="datetime-local" className="form-control" ref='editSluttDato'/>
	              <label className="login-text">Kontakttelefon:</label>
	              <input type="number" className="form-control" ref='editTlf'/>
	              <label className="login-text">Møtested:</label>
	              <input type="text" className="form-control" ref='editMeet'/>
	            </div>
	          </div>
	          <div className="form-group">
	            <label>Beskrivelse:</label>
	            <textarea className="form-control" rows="5" ref='editDescript'></textarea>
	          </div>
	        </form>
	        <div className="login-grid">
	          <div>
							<button ref='btnBackArr' className="btn btn-outline-danger">Tilbake</button>
	          </div>
	          <div className="edit-profile-btn-right">
							<button ref='btneditArr' className="btn btn-success">Lagre</button>
	          </div>
	        </div>
	      </div>
	    </div>
  )}

  componentDidMount() {
    this.refs.btnBackArr.onclick = () => {
      history.push('/divevent');
    }
    userService.getRolelists((result) => {
      for (let rolelist of result) {
        let rolelistSel = document.createElement('OPTION');
        let rolelistName = document.createTextNode(rolelist.name);

        rolelistSel.appendChild(rolelistName);
        this.refs.editRoles.appendChild(rolelistSel);
      }
    })
    let rolelistname = '';
    userService.getDivEvent(eventID, (result) => {

      let rolelistid = result.rolelist_roleID;
      userService.getRoleListByID(rolelistid, (resultrole) => {
        rolelistname = resultrole.name;

        this.refs.editArrName.value = result.name;
        let start = new Date(result.date_start);
        let end = new Date(result.date_end);
        // 7.200.000 er for å legge til 2 timer ettersom -local er 2 timer bak.
        this.refs.editStartDato.valueAsNumber = start.setTime(start.getTime() + 7200000);
        this.refs.editSluttDato.valueAsNumber = end.setTime(end.getTime() + 7200000);
        this.refs.editTlf.value = result.contact_phone;
        this.refs.editRoles.value = rolelistname;
        this.refs.editMeet.value = result.area;
        this.refs.editDescript.value = result.description;
        this.refs.editPoints.value = result.point_award;
        this.refs.editShitManager.value = result.shiftManager;


        this.refs.btneditArr.onclick = () => {
          let newrolelistname = this.refs.editRoles.value;
          userService.getRolelist(newrolelistname, (resultnewrole) => {
            let newroleID = resultnewrole.rolelistID;


            var newName = this.refs.editArrName.value;
            var newStartDato = this.refs.editStartDato.value;
            var newEndDato = this.refs.editSluttDato.value;
            var newTlf = this.refs.editTlf.value;
            var newrolelist = newroleID;
            var newMeet = this.refs.editMeet.value;
            var newDesc = this.refs.editDescript.value;
            var newPoints = this.refs.editPoints.value;
            userService.editArr(eventID, newName, newStartDato, newEndDato, newTlf, newrolelist, newMeet, newDesc, newPoints, (result) => {})
            alert('Arrangemenetet ble oppdatert');
            history.push('/divevent/');
            this.forceUpdate();

          })

        }
      })

    })
  }

}

class Calendar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      events: []
    }
    this.userisloggedin;
  }
  setArrinfo(event) {
    var title = event.title;
    var datestart = event.startDate;
    var dateend = event.endDate;
    eventID = event.eventID;

    userService.getEvent((result) => {
      eventID = event.eventID;
      this.setState({events: result});
      history.push('/divEvent/');
    })

  }
  render() {
    return (<div className="big-container">
			<div className="main-wrap">
        <h1 className="title">Kalender</h1>
      <BigCalendar className="big-calender" messages={{
          next: "Neste",
          previous: "Tilbake",
          today: "I dag",
          month: "Måned",
          week: "Uke",
          work_week: "Jobbuke",
          day: "Dag",
          agenda: "Agenda",
          date: "Dato",
          time: "Tid",
          event: "Arrangement"
        }} events={this.state.events} step={60} startAccessor='startDate' endAccessor='endDate' defaultDate={new Date()} style={{
          height: 400
        }} onSelectEvent={event => this.setArrinfo(event)}/>
			<div className="event-div-grid-btn-right">
        <button className="btn btn-outline-success" ref='CreateEvent'>Opprett arrangement</button>
        <button className="btn btn-outline-danger" ref="Passiv">Meld passiv</button>
      </div>
			</div>
    </div>);
  }
  componentDidMount() {
    this.userisloggedin = userService.browseruser();
    if (this.userisloggedin.admin !== 1) {
      this.refs.CreateEvent.hidden = true;
    }
    this.refs.CreateEvent.onclick = () => {
      history.push('/newEvent/');
      this.forceUpdate();
    }
    this.refs.Passiv.onclick = () => {
      history.push('/passiv/');
      this.forceUpdate();
    }
  }
  componentWillMount() {
    userService.getEvent((result) => {
      this.setState({events: result});
      this.forceUpdate();
    })
  }
}

class Administrator extends React.Component {
  constructor() {
    super();
    this.state = {
      brukergodkjenning: '',
      mannskapsliste: '',
      avslattebrukere: '',
      kompetanseliste: ''
    }
    this.brukere = '';
    this.liste = '';
    this.avslatt = '';
    this.active = '';
  }

  render() {
    return (<div className="big-container">
		<div className="admin-wrap">
      <h1 className="title">Administrasjon</h1>

			<div className="admin-grid">
			<div>
      <h3 className="eventmediumtitle">
        Godkjenn brukere:
      </h3>
      <ul>
        {
          this.state.brukergodkjenning
            ? this.state.brukergodkjenning
            : 'Det er ingen brukere å aktivere.'
        }
      </ul>
      <h5 className="eventmediumtitle">
        Avslåtte brukere:
      </h5>
      <ul>
        {
          this.state.avslattebrukere
            ? this.state.avslattebrukere
            : 'Ingen brukere er avslått.'
        }
      </ul>
      <h5 className="eventmediumtitle">
        Godkjenn kompetanse:
      </h5>
    <ul>
      {
        this.state.kompetanseliste
        ? this.state.kompetanseliste
        : 'Det er ingen kompetanse til godkjenning.'
      }
    </ul>
			</div>
			<div>
      <h3 className="eventmediumtitle">
        Vaktmaler:
      </h3>
      <ul>
        {this.state.mannskapsliste}
      </ul>
        <div className="admin-btn-add">
          <button className="btn btn-success" ref="newrole">Legg til vaktmaler og roller</button>
        </div>
      </div>
		</div>

		</div>
    </div>)
  }

  updateDenyUser(userid) {
    let inactive = 2;
    userService.changeUser(inactive, userid, (result) => {
      userService.getInactiveUsers(userid, (result) => {
        this.brukere = result;
        this.skrivutinfo();
        userService.getDeniedUsers(userid, (result) => {
          this.avslatt = result;
          this.skrivutavslatt();
        })
      })
    })
  }

  updateuser(userid) {
    let inactive = 0;
    userService.changeUser(inactive, userid, (result) => {
      userService.getInactiveUsers(userid, (result) => {
        this.brukere = result;
        this.skrivutinfo();
      })
    })
  }

  updateavslatt(userid) {
    let inactive = 0;
    userService.changeUser(inactive, userid, (result) => {
      userService.getDeniedUsers(userid, (result) => {
        this.avslatt = result;
        this.skrivutavslatt();
      })
    })
  }

  skrivutmannskapsinfo() {
    let mannskap = [];
    for (let rolelist of this.liste) {
      mannskap.push(<li className="admin-li" key={rolelist.rolelistID}>
        {rolelist.name + " "}
        <div className="admin-btn-edit">
        <button className="btn btn-outline-danger btn-sm" onClick= {() => {
					history.push('/changerole')
					rolelistID = rolelist.rolelistID;
				}}>Rediger</button>
        </div>
      </li>)
    }
    this.setState({mannskapsliste: mannskap})
  }

  skrivutavslatt() {
    let utskriftavslatt = [];
    for (let user of this.avslatt) {
      utskriftavslatt.push(<li className="admin-li" key={user.userID}>
        {user.firstname + " " + user.lastname + " "}
        <div className="admin-btn-edit">
        <button className="btn btn-outline-danger btn-sm" onClick = {() => {
					this.updateavslatt(user.userID)
				}}>Angre</button>
      </div>
      </li>)
    }
    this.setState({avslattebrukere: utskriftavslatt})
  }

  updatecomplist(compuserID, userid) {
    let active = 0
    userService.acceptCompetence(active, userid, compuserID, (result) => {
      userService.getDivUserComp((result) => {
      this.active = result;
      this.userCompList();
    })
  })
 }

 deletecompuser(userid, compuserID) {
   userService.deletefromcomplist(userid, compuserID, (result) => {
     userService.getDivUserComp((result) => {
       this.active = result;
       this.userCompList();
     })
   })
 }

  userCompList()  {
    let usercomp = [];
    for (let user_has_competence of this.active) {
      const reader = new FileReader();
      usercomp.push(<li className="admin-li" key={user_has_competence.compuserID}>
        <div className="admin-accept-role">
        {user_has_competence.firstname + " " + user_has_competence.lastname + " " + user_has_competence.title}
      </div>
        <div className="admin-btn-edit">
        <button className="btn btn-outline-success btn-sm" onClick = {() => {
          this.updatecomplist(user_has_competence.compuserID, user_has_competence.userID);
        }}>Aksepter</button>
        <button className="btn btn-outline-danger btn-sm" onClick = {() => {
          this.deletecompuser(user_has_competence.userID, user_has_competence.compuserID)
				}}>Avslå</button>
      </div>
      </li>)
    }
    this.setState({kompetanseliste: usercomp})
  }

  skrivutinfo() {
    let utskrift = [];
    for (let user of this.brukere) {
      utskrift.push(<li className="admin-li" key={user.userID}>
        {user.firstname + " " + user.lastname + " "}
        <div className="admin-btn-edit">
        <button className="btn btn-outline-success btn-sm" onClick = {() => {
					this.updateuser(user.userID)
				}}>Aksepter</button>
			<button className="btn btn-outline-danger btn-sm" onClick = {() => {
					this.updateDenyUser(user.userID)
				}}>Avslå</button>
      </div>
      </li>)
    }
    this.setState({brukergodkjenning: utskrift})
  }

  componentDidMount() {
    this.refs.newrole.onclick = () => {
      history.push('/makenewrole/')
    }
    userService.getInactiveUsers(userid, (result) => {
      this.brukere = result;
      this.skrivutinfo();
    })
    userService.getRolelists((result) => {
      this.liste = result;
      this.skrivutmannskapsinfo();
    })
    userService.getDeniedUsers(userid, (result) => {
      this.avslatt = result;
      this.skrivutavslatt();
    })
    userService.getDivUserComp((result) => {
      this.active = result;
      this.userCompList();
    })
  }
}

class NewRole extends React.Component {
  render() {
    return (<div className="big-container">
      <div className="main-wrap">
      <h1 className="title">Opprett vaktmal</h1>
    <div className="role-wrap">
    <div>
      <form>
        <label className="role-input">
          Navn på vaktmalen:
          <input className="form-control" ref='NewRoleName' type='text'/>
        </label>
        <label className="role-input">
          Beskrivelse av vaktmalen:
          <input className="form-control" ref='NewRoleDesc' type='text'/>
        </label>
      </form>
      <button className="btn btn-success" ref='btnSendRole'>Opprett vaktmal</button>

    </div>
    <br/>
    <div>
      <b>For å legge til roller i vaktmalen som blir opprettet må du velge 'rediger' som finnes under adminsiden.</b>

    <form>
        <h4 className="role-title">Opprett ny rolle:</h4>
        <label className="role-input">
          Rollenavn:
          <input className="form-control" ref='addRole' type='text'/>
        </label>
        <label className="role-input">
          Kurs som kreves:
          <input className="form-control" ref='compRequired' type='text' />
        </label>
      </form>
      <button className="btn btn-success" ref='regRole'>Opprett rolle</button>
  </div>
    </div>
      <div className="role-grid">
        <div>
          <b>Eksisterende roller:</b>
          <div ref='showRoles'></div>
      </div>
        <div className="role-comp-list">
          <b>Kompetanse som kreves for hver rolle:</b>
          <div ref='showComps'></div>
        </div>
    </div>
        <button className="btn btn-outline-danger" ref='btnBackRole'>Tilbake</button>
      </div>
        </div>)
  }

  componentDidMount() {
    this.update();
  }

   update() {
    this.refs.regRole.onclick = () => {
      let newroletitle = this.refs.addRole.value;
      let newcomptitle = this.refs.compRequired.value;
      let newcompid = 22;
      userService.addCompetence(newcomptitle, (result) => {
        userService.getComp(newcomptitle, (result) => {
          let newcompid = result[0].compID;
          userService.addRole(newcompid, newroletitle, (result) => {
            this.refs.showRoles.innerText = '';
            this.refs.showComps.innerText = '';
            this.update();
          });
        })
  })
  }

    userService.getRoles((result) => {
      for(let rolename of result){

        let thisRoleID = rolename.roleID;
        let roleLi = document.createElement('LI');
        let roleLiTxt = document.createTextNode(rolename.title);

        roleLi.appendChild(roleLiTxt);
        this.refs.showRoles.appendChild(roleLi);

        userService.getCompID(thisRoleID, (result) => {
          let compLi = document.createElement('LI');
          let compLiTxt = document.createTextNode(result.title);

          compLi.appendChild(compLiTxt);
          this.refs.showComps.appendChild(compLi);
        })
      }
    });

    this.refs.btnBackRole.onclick = () => {
      history.push('/admin/');
    }

    this.refs.btnSendRole.onclick = () => {
      let name = this.refs.NewRoleName.value;
      let description = this.refs.NewRoleDesc.value;

      userService.addRoleList(name, description, (result) => {
        history.push('/admin/');
        this.forceUpdate();
      })
    }
  }
}

class ChangeRole extends React.Component {
  constructor() {
    super();
  }

  render() {
    return (<div className="big-container">
			<div className="main-wrap">
      <h1 className="title">Rediger vaktmal</h1>
				<div className="admin-grid">
					<div className="form-group admin-role-form">
			      <h3 className="medium-title" ref='roleName'></h3>
			      <label>
			        Navn på vaktmalen:
            </label>
            <input className="form-control" ref='editRoleName' type='text'/><br/>
			      <label>
			        Beskrivelse:
            </label>
			        <input className="form-control" ref='editDescription' type='text'/><br/>
			      <label>Legg til rolle:
            </label>
			        <select className="form-control" ref='roleSelect'></select>
              <div className="role-btn-add">
                <button className="btn btn-outline-success role-input" ref='addRoleToList'>Legg til</button>
              </div>
					</div>

					<div>
						<h3 className="medium-title">Rolleliste:</h3>
			      <div ref='savedRoles'>
			      </div>
					</div>

					<div className="admin-btn-left">
						<button className="btn btn-outline-danger" ref="back">Tilbake</button>
					</div>

          <div className="admin-btn-right">
          <div className="">
						<button className="btn btn-success" ref="EditRole">Lagre</button>
          </div>
          <div className="">
						<button className="btn btn-danger" ref='deleteRoleList'>Slett vaktmal</button>
          </div>
        </div>
				</div>
		</div>
    </div>)
  }
  update() {
		this.refs.deleteRoleList.onclick = () => {
			userService.deleteRoleList(rolelistID, (result) => {
				history.push('/admin');
			})
		}

    userService.getThisRoleList(rolelistID, (result) => {
      this.refs.editRoleName.value = result.name;
      this.refs.editDescription.value = result.description;
      this.refs.roleName.innerText = result.name;
    })
    this.refs.EditRole.onclick = () => {
      var editname = this.refs.editRoleName.value;
      var editDescription = this.refs.editDescription.value;

      userService.editRoleList(rolelistID, editname, editDescription, (result) => {})
      history.push('/admin/');
    }
    this.refs.back.onclick = () => {
      history.push('/admin/')
    }
    userService.getRoles((result) => {
      for (let role of result) {
        let roleSel = document.createElement('OPTION');
        let roleTitle = document.createTextNode(role.title);

        roleSel.appendChild(roleTitle);
        this.refs.roleSelect.appendChild(roleSel);
      }
    })
    userService.getRolesFromList(rolelistID, (result) => {
      for (let listrole of result) {
        let roleitem = document.createElement('LI');
        let roleitemTitle = document.createTextNode(listrole.title + ' ');
        roleitem.className = "admin-li"

				let btnDeleteRole = document.createElement('BUTTON');
				let btnDeleteRoleTxt = document.createTextNode('Slett');
				btnDeleteRole.appendChild(btnDeleteRoleTxt);
				btnDeleteRole.setAttribute('id',listrole.roleID);
				btnDeleteRole.className = "btn btn-outline-danger btn-sm"

        let divBtnDeleteRole = document.createElement('div');
        divBtnDeleteRole.appendChild(btnDeleteRole);
        divBtnDeleteRole.className = "admin-btn-edit";

        roleitem.appendChild(roleitemTitle);
				roleitem.appendChild(divBtnDeleteRole);
        this.refs.savedRoles.appendChild(roleitem);
				let roleID = btnDeleteRole.id;

				btnDeleteRole.onclick = () => {
					userService.deleteRoleFromList(rolelistID, roleID, (result) => {
						this.refs.savedRoles.innerText = '';
            this.refs.roleSelect.innerText = '';
						this.update();
					});
				}
      }
    })
    this.refs.addRoleToList.onclick = () => {
      let roletitle = this.refs.roleSelect.value;
      userService.getRole(roletitle, (result) => {
        let roleID = result.roleID;

        userService.addRoleToList(roleID, rolelistID, (result) => {
					// this.refs.savedRoles.innerText = 'Rolleliste:';
					this.refs.savedRoles.innerText = '';
          this.refs.roleSelect.innerText = '';
          this.update();

        });
      })
    }
  }
  componentDidMount() {
    this.update();
  }
}

class Passiv extends React.Component {
  render() {
    return (<div className="big-container">
    <div className="main-wrap">
      <h1 className="title">Velg dato</h1>

    <div className="passive-wrap">
      <form>
        <label>
          <p>Startdato:</p>
        <input className="form-control" ref='passivdato' type='date'/><br/>
        </label>
      </form>
      <form>
        <div className="passive-align">
        <label>
          <p className="passive-enddate">Sluttdato:</p>
          <input className="form-control" ref='passivenddato' type='date'/><br/>
        </label>
      </div>
      </form>
      <div>
        <button className="btn btn-outline-danger" ref="backbutton">
          Tilbake</button>
      </div>
      <div className="passive-btn">
        <button className="btn btn-danger" ref="passivbutton">
          Meld passiv</button>
      </div>
    </div>
    </div>
    </div>);
  }
  componentDidMount() {
    this.refs.backbutton.onclick = () => {
      history.push('/calendar');
    }
    this.refs.passivbutton.onclick = () => {
      var userID = userid;
      var date_Start = this.refs.passivdato.value;
      var date_End = this.refs.passivenddato.value;

      userService.getUser(userid, (result) => {
        userService.addPassive(userid, date_Start, date_End, (result) => {
          alert('Du er lagt passiv mellom ' + date_Start + " til " + date_End)
          history.push('/calendar/');
        })
      })
    }
  }
}

class NewEvent extends React.Component {
  render() {
    return (<div className="big-container">
      <div className="new-event-bg">
        <h1 className="eventmediumtitle">Legg til arrangement</h1>
        <form>
          <div className="login-grid">
            <div className="form-group">
              <label className="login-text">Tittel:</label>
              <input type="text" className="form-control" ref='regArrName'/>
              <label className="login-text">Startdato:</label>
              <input type="datetime-local" className="form-control" ref='regStartDato'/>
              <label className="login-text">Vaktansvarlig:</label>
              <input type="text" className="form-control" ref='regshiftManager'/>
              <label className="login-text">Vaktlag:</label>
              <select className="form-control" id="exampleFormControlSelect1" ref='rolelistSelect'></select>
            </div>
            <div className="form-group">
              <label className="login-text">Vaktpoeng:</label>
              <input type="number" className="form-control" ref='regPoints'/>
              <label className="login-text">Sluttdato:</label>
              <input type="datetime-local" className="form-control" ref='regSluttDato'/>
              <label className="login-text">Kontakttelefon:</label>
              <input type="number" className="form-control" ref='regTlf'/>
              <label className="login-text">Møtested:</label>
              <input type="text" className="form-control" ref='regMeet'/>
            </div>
          </div>
          <div className="form-group">
            <label>Beskrivelse:</label>
            <textarea className="form-control" rows="5" ref='regDescript'></textarea>
          </div>
        </form>
        <p className="event-div-descrip-error" ref="feilmelding"></p>
        <div className="login-grid">
          <div>
						<button ref='btnBackArr' className="btn btn-outline-danger">Tilbake</button>
          </div>
          <div className="edit-profile-btn-right">
						<button ref='btnSendArr' className="btn btn-success">Legg til</button>
          </div>
        </div>
      </div>
    </div>)
  }
  componentDidMount() {
    let rolelistid = 0;
    userService.getRolelists((result) => {
      for (let rolelist of result) {
        let rolelistSel = document.createElement('OPTION');
        let rolelistName = document.createTextNode(rolelist.name);

        rolelistSel.appendChild(rolelistName);
        this.refs.rolelistSelect.appendChild(rolelistSel);
      }
    })

    this.refs.btnBackArr.onclick = () => {
      history.push('/events/');
      this.forceUpdate();
    }

    this.refs.btnSendArr.onclick = () => {
      let name = this.refs.regArrName.value;
      let date_start = this.refs.regStartDato.value;
      let date_end = this.refs.regSluttDato.value;
      let contact_phone = this.refs.regTlf.value;
      let description = this.refs.regDescript.value;
      let area = this.refs.regMeet.value;
      let point_award = this.refs.regPoints.value;
      let shiftManager = this.refs.regshiftManager.value;
      let rolelistName = this.refs.rolelistSelect.value;

      userService.getRolelist(rolelistName, (result) => {
        rolelistid = result.rolelistID;
        if (!name) {
          this.refs.feilmelding.innerText = "Du må skrive inn en tittel";
        } else if (!point_award) {
          this.refs.feilmelding.innerText = "Du må skrive inn vaktpoeng for arrangementet";
        } else if (date_start == "") {
          this.refs.feilmelding.innerText = "Du må skrive inn en startdato";
        } else if (date_end == "") {
          this.refs.feilmelding.innerText = "Du må skrive inn en sluttdato";
        } else if (!shiftManager) {
          this.refs.feilmelding.innerText = "Du må skrive inn en Vaktansvarlig";
        } else if (!contact_phone) {
          this.refs.feilmelding.innerText = "Du må skrive inn et telefonnummer";
        } else if (!area) {
          this.refs.feilmelding.innerText = "Du må skrive inn et møtested";
        } else if (!description) {
          this.refs.feilmelding.innerText = "Du må skrive inn en beskrivelse";
        } else {
        userService.addEvent(name, date_start, date_end, contact_phone, rolelistid, description, area, point_award, shiftManager, (result) => {
            this.refs.feilmelding.innerText = "Du må fylle ut skjemaet riktig";
          alert('Arrangementet er opprettet');
          history.push('/events/');
          this.forceUpdate();
        })
      }
    })
    }
  }
}

class Search extends React.Component {
  constructor() {
    super();
    this.userisloggedin
  }
  render() {
    return (<div className="big-container">
		<div className="main-wrap">
      <h1 className="title">Brukersøk</h1>
			<div className="form-inline">
				<input className="form-control col-4" ref='searchField' type="text" placeholder="Du kan søke på navn, epost og tlfnummer" />
        <div className="search-btn">
          <button className="btn btn-outline-danger" ref='btnSearch'>Søk</button>
        </div>
			</div>
			<br />
    		<div className="search-flex" ref='output'></div>
		</div>
    </div>);
    //Sørg for at når man går ut av profilen, endres userid tilbake til admin
  }
  componentDidMount() {
    this.userisloggedin = userService.browseruser();

    this.refs.searchField.onkeyup = (event) => {
      event.preventDefault();
      if(event.keyCode === 13){
        this.refs.btnSearch.click();
      }
    };

    this.refs.btnSearch.onclick = () => {
      let keyword = this.refs.searchField.value;

      userService.search(keyword, (result) => {
        this.refs.output.innerText = '';

        if (result == '') {
          this.refs.output.innerText = '\n' + 'Ingen resultater';
        }

        for (let user of result) {
          let clickedUser = user.userID;
          let divUser = document.createElement('DIV');
					divUser.className = "search-bg";
          let btnUser = document.createElement('BUTTON');
          let btnUserTxt = document.createTextNode('Rediger');
          let divBtnUser = document.createElement('div');
          btnUser.appendChild(btnUserTxt);
          btnUser.className = "btn btn-outline-danger btn-sm";
          btnUser.setAttribute('id', user.userID);


          btnUser.onclick = () => {
            sendToUser(clickedUser);
          }

          divBtnUser.appendChild(btnUser);
          divBtnUser.className = "search-btn-user";

          let divFullName = document.createTextNode(user.firstname + ' ' + user.lastname);
          divFullName.className = "search-user-name";
					let divUserInfo = document.createTextNode('Epost: ' + user.email + ' - ' + 'Telefon: ' + user.phone + ' ');
					let linebreak = document.createElement('BR');

          divUser.appendChild(divFullName);
					divUser.appendChild(linebreak);
					divUser.appendChild(divUserInfo);
          if (this.userisloggedin.admin == 1) {
            divUser.appendChild(divBtnUser);
          divUser.className = "search-user"
          }
          this.refs.output.appendChild(divUser);
        }
      })

      function sendToUser(id) {
        viewid = id;
        history.push('/editotherprofile/',);
      }
    }
    this.refs.btnSearch.click();
  }
}

ReactDOM.render((<HashRouter>
  <div>
    <Navbar/>
    <Switch>
      <Route exact path='/makenewrole' component={NewRole}/>
      <Route exact path='/changerole' component={ChangeRole}/>
      <Route exact path='/editotherprofile' component={EditOtherProfile}/>
      <Route exact path='/admin' component={Administrator}/>
      <Route exact path='/passiv' component={Passiv}/>
      <Route exact path='/forgotPassword' component={ForgotPassword}/>
      <Route exact path='/vaktliste' component={Vaktliste}/>
      <Route exact path='/editevent' component={EditEvent}/>
      <Route exact path='/divevent' component={DivEvent}/>
      <Route exact path='/newEvent' component={NewEvent}/>
      <Route exact path='/homepage' component={Homepage}/>
      <Route exact path='/loginPage' component={LoginPage}/>
      <Route exact path='/register' component={Register}/>
      <Route exact path='/calendar' component={Calendar}/>
      <Route exact path='/profile' component={Profile}/>
      <Route exact path='/editprofile' component={EditProfile}/>
      <Route exact path='/events' component={Events}/>
      <Route exact path='/contact' component={Contact}/>
      <Route exact path='/search' component={Search}/>
      <Route exact path='/competence' component={Competence}/>
      <Redirect from="/" to="/loginPage"/>
    </Switch>
  </div>
</HashRouter>), document.getElementById('root'));
