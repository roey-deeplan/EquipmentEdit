import * as React from 'react';
import { getSP } from '../pnpjs-config';
import styles from './EquipmentEdit.module.scss';
import type { IEquipmentEditProps } from './IEquipmentEditProps';
import { IEquipmentEditStates } from './EquipmentEditStates';
import Swal from 'sweetalert2'
import {
  Popover, PopoverHeader, PopoverBody, Fade
} from 'reactstrap';
import { ThemeProvider, StylesProvider } from "@material-ui/core/styles"
import { DemoContainer } from "@mui/x-date-pickers/internals/demo"
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs"
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider"
import { DatePicker } from "@mui/x-date-pickers/DatePicker"
import { ArrowLeftIcon, ArrowRightIcon } from "@mui/x-date-pickers"
import { PeoplePicker } from "@pnp/spfx-controls-react/lib/PeoplePicker"
import dayjs from "dayjs"
import "dayjs/locale/he"
import { jss } from "../models/jss"
import { theme } from "../models/theme"
import { ButtonsTheme } from "../models/ButtonsTheme"
import { Select, TextField, FormControl, MenuItem, Autocomplete, Chip, Tooltip, Alert } from "@mui/material"
import { Button } from "@material-ui/core"
import { AiOutlineSend } from "react-icons/ai"
import { IoCloseCircleOutline } from "react-icons/io5"
import stylisRTLPlugin from "stylis-plugin-rtl";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
const { solution } = require('../../../../config/package-solution.json')

export default class EquipmentEdit extends React.Component<IEquipmentEditProps, IEquipmentEditStates> {
  constructor(props: IEquipmentEditProps) {
    super(props)
    this.state = {
      isLoading: false,
      requestDate: new Date(),
      userDepartment: "אחר",
      departmentId: 0,
      selectedHardwareTypes: [],
      hardwareTypesList: [],
      orderReason: "חדש",
      wearDescription: "",
      requestDetail: "",
      currentUser: null,
      companyDepartments: [],
      ChangeHasMade: false,
      FormSubmitError: false,
      FormAlreadyExist: false,
      popoverOpen: false,
      wearIsShown: false,
      isHWPlaceholderVisible: false,
      orderReasonValidationError: false,
      requestDetailValidationError: false,
      selectedHardwareTypesValidationError: false,
      ValidationError: false,
      formId: 0,
      formIsActiveStatus: false
    }
  }

  public sp: any

  // Use for direction rtl
  cacheRtl = createCache({
    key: "muirtl",
    stylisPlugins: [stylisRTLPlugin],
  });

  componentDidMount() {
    console.log("Equipment New Version: " + solution.version)

    // Start Loader
    this.setState({
      isLoading: true,
    })

    // Initialize sp
    this.sp = getSP(this.props.context)

    // Reset all the values in the form
    this.ResetForm()
  }

  ResetForm() {
    // get all the items from the list 'Company Departments'.
    this.sp.web.lists.getById(this.props.companyDepartmentsList).items().then((companies: string[]) => {
      this.setState({ companyDepartments: companies, })
    }).then(() => {
      this.sp.web.lists.getById(this.props.equipmentList).items().then((equipments: any[]) => {
        let hwList: string[] = equipments.map((equipment) => equipment.Title);
        this.setState({ hardwareTypesList: hwList })
      })
      // get current user
      this.sp.web.currentUser.select()().then((user: any) => {
        this.setState({ currentUser: user, })
        // Choose which group title is attached to the user
        this.sp.web.siteUsers.getById(user.Id).groups().then((groups: any) => {
          if (groups.some((group: any) => group.Title === "מחלקת פיתוח")) {
            this.companyDepartmentHandler("פיתוח")
          } else if (groups.some((group: any) => group.Title === "מחלקת גיוס")) {
            this.companyDepartmentHandler("גיוס")
          } else if (groups.some((group: any) => group.Title === "מחלקת חומרה")) {
            this.companyDepartmentHandler("חומרה")
          } else {
            this.companyDepartmentHandler("אחר")
          }
          this.setState({ isLoading: false, formIsActiveStatus: true })
        }).catch((error: any) => console.error(error))
      }).catch((error: any) => console.error(error))
    }).catch((error: any) => console.error(error))
  }

  // Validate the form
  ValidateForm(): boolean {
    let validated = true;

    // Validate selectedHardwareTypes
    if (this.state.selectedHardwareTypes.length === 0 ||
      this.state.selectedHardwareTypes.length === null ||
      this.state.selectedHardwareTypes.length === undefined) {
      validated = false;
      this.setState({ selectedHardwareTypesValidationError: true })
    }

    // Validate orderReason
    if (this.state.orderReason === null || this.state.orderReason === '' || this.state.orderReason === undefined) {
      validated = false;
      this.setState({ orderReasonValidationError: true });
    }

    return validated;
  }

  // Submit all the data only if the requierd fields are filled
  onSubmitHandler(event: any) {
    event.preventDefault()
    if (this.ValidateForm()) {
      let TitleName = this.state.currentUser.Title + " " + this.ConvertToDisplayDate(new Date())
      // If the form already saved
      if (this.state.formId !== null && this.state.formId !== undefined && this.state.formId !== 0 && !isNaN(this.state.formId)) {
        // Get edit page url for link
        let formUrl = this.props.LinkToEditForm + "?FormID=" + this.state.formId.toString();
        // Update the item
        this.sp.web.lists.getById(this.props.ordersList).items.getById(this.state.formId).update({
          Title: this.state.currentUser.Title,
          DateOfRequest: this.state.requestDate,
          EmployeeNameId: this.state.currentUser.Id,
          Department: this.state.userDepartment,
          HardwareType: this.state.selectedHardwareTypes,
          OrderReason: this.state.orderReason,
          WearDescription: this.state.wearDescription,
          DetailRequest: this.state.requestDetail,
          FormTitle: {
            "Description": TitleName,
            "Url": formUrl
          }
        })
          .then(() => {
            // Show a success message
            Swal.fire({
              position: "center",
              icon: "success",
              title: "הטופס עודכן בהצלחה",
              showConfirmButton: false,
              timer: 2000,
            });
            // Delay the navigation for 2 seconds
            setTimeout(() => {
              // Redirect or navigate to the desired link
              window.location.href = this.props.ReturnLink
            }, 2000);
          }).catch((error: Error) => {
            console.error(error);
          })
      } else {
        if ((this.state.currentUser !== null && this.state.currentUser !== undefined) &&
          (this.state.userDepartment !== null && this.state.userDepartment !== undefined && this.state.userDepartment !== "")) {
          this.setState({ isLoading: true, formIsActiveStatus: false });
          // Add the item to the list
          this.sp.web.lists.getById(this.props.ordersList).items
            .add({
              Title: this.state.currentUser.Title,
              DateOfRequest: this.state.requestDate,
              EmployeeNameId: this.state.currentUser.Id,
              Department: this.state.userDepartment,
              HardwareType: this.state.selectedHardwareTypes,
              OrderReason: this.state.orderReason,
              WearDescription: this.state.wearDescription,
              DetailRequest: this.state.requestDetail,
            })
            .then((AddResult: any) => {
              // Update form link
              this.sp.web.lists.getById(this.props.ordersList).items.getById(AddResult.data.Id).update({
                FormTitle: {
                  "Description": TitleName,
                  "Url": this.props.LinkToEditForm + "?FormID=" + AddResult.data.Id
                }
              })
              this.setState({ formId: AddResult.data.Id })
            })
            .then(() => {
              this.setState({ isLoading: false, formIsActiveStatus: true })
              // Show a success message
              Swal.fire({
                position: "center",
                icon: "success",
                title: "הטופס נשלח בהצלחה",
                showConfirmButton: false,
                timer: 2000,
              });
              // Delay the navigation for 2 seconds
              setTimeout(() => {
                // Redirect or navigate to the desired link
                window.location.href = this.props.ReturnLink
              }, 2000);
            }).catch((error: Error) => {
              this.setState({ isLoading: false, formIsActiveStatus: true })
              console.error(error);
            })
        } else {
          this.setState({ ValidationError: true })
          setTimeout(() => {
            this.setState({ ValidationError: false })
          }, 5000);
        }
      }
    }
  }

  // Close Validation Error message after 3 seconds
  CloseValidationErrorMessage = () => {
    setTimeout(() => {
      this.setState({
        ValidationError: false
      });
    }, 3000);
  }

  // Change the state of the user department
  companyDepartmentHandler(Department: string) {
    const department = this.state.companyDepartments.find((company: any) => company.Title === Department)
    this.setState({
      userDepartment: department?.Title,
      departmentId: department?.Id,
    })
  }

  // User handle when the user change the states changes
  userHandler(event: any) {
    // Checks if the there is a user in the text field
    if (event.length > 0) {
      const userEmail = event[0].secondaryText
      this.sp.web.siteUsers
        .getByEmail(userEmail)()
        .then((user: any) => {
          this.setState({
            currentUser: user,
          })
          // Choose which group title is attached to the user
          this.sp.web.siteUsers
            .getById(user.Id)
            .groups()
            .then((groups: any) => {
              if (groups.some((group: any) => group.Title === "מחלקת פיתוח")) {
                this.companyDepartmentHandler("פיתוח")
              } else if (groups.some((group: any) => group.Title === "מחלקת גיוס")) {
                this.companyDepartmentHandler("גיוס")
              } else if (groups.some((group: any) => group.Title === "מחלקת חומרה")) {
                this.companyDepartmentHandler("חומרה")
              } else {
                this.companyDepartmentHandler("אחר")
              }
            })
        })
        .catch((error: Error) => console.error(error))
    }
  }

  // Date handle to save the changes of a new date
  dateHandler(event: any) {
    this.setState({ requestDate: event })
  }

  // Convert To Web Date format
  ConvertToDisplayDate = (ReleventDate: Date | null) => {
    // If not empty or null
    if (ReleventDate) {
      // Get day,month and year
      let dd = String(ReleventDate.getDate());
      let mm = String(ReleventDate.getMonth() + 1); //January is 0!
      let yyyy = String(ReleventDate.getFullYear());
      if (parseInt(dd) < 10) {
        dd = '0' + dd;
      }
      if (parseInt(mm) < 10) {
        mm = '0' + mm;
      }

      // Create web format
      let FormattedReleventDate = dd + '/' + mm + '/' + yyyy;

      return FormattedReleventDate;
    } else {
      return null;
    }
  }

  // Put all the types of hardware in array
  hardwareTypeHandler = (event: any, value: any) => {
    this.setState({
      selectedHardwareTypes: value,
      isHWPlaceholderVisible: value.length !== 0,
      selectedHardwareTypesValidationError: value.length === 0,
    })
  }

  // Close The form
  CloseTheForm = () => {
    // Redirect to the url that defined in the webpart properties
    window.location.href = this.props.ReturnLink;
  }

  // Pop over the little modal for closing the form
  PopOverToggle = () => {
    this.setState({
      popoverOpen: !this.state.popoverOpen
    });
  }

  public render(): React.ReactElement<IEquipmentEditProps> {

    return (
      <div dir="rtl">
        <CacheProvider value={this.cacheRtl}>
          <StylesProvider jss={jss}>
            <ThemeProvider theme={theme}>
              <div className={styles.EONewFormContainer}>
                <div className={styles.EOHeader}>
                  <div className={styles.EOHeaderContainer}>
                    <span className={styles.EOHeaderText}>{this.props.FormName}</span>
                  </div>
                  <div className={styles.EOLogoContainer}></div>
                </div>
                {this.state.isLoading ?
                  <div className={styles.SpinnerComp}>
                    <div className={styles.loadingScreen}>
                      <div className={styles.loaderWrap}>
                        <span className={styles.loaderAnimation}></span>
                        <div className={styles.loadingText}>
                          <span className={styles.letter}>ב</span>
                          <span className={styles.letter}>ט</span>
                          <span className={styles.letter}>ע</span>
                          <span className={styles.letter}>י</span>
                          <span className={styles.letter}>נ</span>
                          <span className={styles.letter}>ה</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  : null}
                {this.state.formIsActiveStatus ?
                  <form className={styles.containerForm} onSubmit={this.onSubmitHandler}>
                    <div className={styles.colForm}>
                      <p className={styles.rowFormName}>שם העובד</p>
                      <div>
                        <PeoplePicker
                          context={this.props.context as any}
                          personSelectionLimit={1}
                          showtooltip={false}
                          required={true}
                          defaultSelectedUsers={[this.state.currentUser && this.state.currentUser.Email]}
                          onChange={(event) => this.userHandler(event)}
                          principalTypes={[1]}
                          disabled
                        />
                      </div>
                    </div>
                    <div className={styles.colForm}>
                      <p className={styles.rowFormName}>תאריך הבקשה </p>
                      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="he">
                        <DemoContainer components={["DatePicker"]}>
                          <DatePicker
                            slotProps={{ textField: { variant: "standard", size: "small" } }}
                            disabled
                            readOnly
                            value={dayjs(this.state.requestDate) as any}
                            onChange={(newDate) => this.dateHandler(newDate)}
                            slots={{
                              leftArrowIcon: ArrowRightIcon,
                              rightArrowIcon: ArrowLeftIcon,
                            }}
                            className={styles.roundedDatePicker}
                          />
                        </DemoContainer>
                      </LocalizationProvider>
                    </div>
                    <div className={styles.colForm}>
                      <p className={styles.rowFormName}>מחלקה</p>
                      <Autocomplete
                        disabled
                        style={{ direction: 'rtl' }}
                        disablePortal
                        id="combo-box-demo"
                        options={this.state.companyDepartments.map((department: any) => department.Title)}
                        onChange={(newValue: any) => this.setState({ userDepartment: newValue })}
                        value={this.state.userDepartment}
                        defaultValue={"אחר"}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            className={styles.textFieldHw}
                            required
                            variant="standard"
                            InputProps={{ ...params.InputProps, }}
                          />
                        )}
                      />

                    </div>
                    <div className={styles.colForm}>
                      <p className={styles.rowFormName}>
                        סוג החומרה <span className={styles.requiredDot}>*</span>
                      </p>
                      <div>
                        <Autocomplete
                          disabled
                          style={{ direction: 'rtl' }}
                          disablePortal
                          id="combo-box-demo"
                          options={this.state.hardwareTypesList}
                          multiple
                          onChange={this.hardwareTypeHandler}
                          value={this.state.selectedHardwareTypes}
                          renderInput={(params) => (
                            <TextField
                              className={styles.textFieldHw}
                              placeholder={this.state.isHWPlaceholderVisible ? '' : 'בחר/י'}
                              required
                              variant="standard"
                              helperText={this.state.selectedHardwareTypesValidationError ? 'נא לבחור לפחות פריט אחד' : ""}
                              error={this.state.selectedHardwareTypesValidationError}
                              {...params}
                            />
                          )}
                          renderTags={(value, getTagProps) =>
                            value.map((option, index) => (
                              <Chip
                                label={option}
                                color="primary"
                                variant="outlined"
                                {...getTagProps({ index })}
                              />
                            ))
                          }
                        />
                      </div>
                    </div>
                    <div className={styles.colForm}>
                      <p className={styles.rowFormName}>
                        סיבת ההזמנה <span className={styles.requiredDot}>*</span>
                      </p>
                      <div className={styles.innerColChoise}>
                        <FormControl variant="standard" className={styles.innerColChoiseReason}>
                          <Tooltip title={this.state.orderReason}>
                            <Select
                              disabled
                              onChange={(event) => {
                                this.setState({ orderReason: event.target.value });
                                if (event.target.value === 'חדש') {
                                  this.setState({ wearDescription: '' });
                                  this.setState({ wearIsShown: false });
                                } else if (event.target.value === 'בלאי') {
                                  this.setState({ wearIsShown: true });
                                }
                              }}
                              value={this.state.orderReason}
                              defaultValue={this.state.orderReason}
                              inputProps={{ 'aria-label': 'Without label' }}
                            >
                              <MenuItem value={'חדש'}>חדש</MenuItem>
                              <MenuItem value={'בלאי'}>בלאי</MenuItem>
                            </Select>
                          </Tooltip>
                        </FormControl>
                        {this.state.wearIsShown && <>
                          <div className={styles.rowTextFieldWear}>
                            <p className={styles.rowFormName}>פרט:</p>
                          </div>
                          <TextField
                            disabled
                            style={{ width: '100%' }}
                            variant="standard"
                            value={this.state.wearDescription}
                            onChange={(event) => {
                              if (this.state.orderReason === "בלאי") {
                                this.setState({ wearDescription: event.target.value })
                              }
                            }}
                            multiline
                            maxRows={3}
                            placeholder="תיאור בלאי"
                            hiddenLabel={true}
                          />
                        </>}
                      </div>
                    </div>
                    <div className={styles.colForm}>
                      <p className={styles.rowFormName}>פירוט הבקשה</p>
                      <TextField
                        disabled
                        multiline
                        maxRows={4}
                        onChange={(event) => {
                          this.setState({ requestDetail: event.target.value })
                        }}
                        value={this.state.requestDetail}
                        variant="standard"
                        placeholder="פרט\י..."
                        size="small"
                      ></TextField>
                    </div>
                    <div className={styles.approvalStatusTitle}>
                      <h4>אישורים</h4>
                    </div>
                    <form>
                      <ThemeProvider theme={ButtonsTheme}>
                        <div className={styles.FormButtons}>
                          <Button
                            variant="contained"
                            id="PopoverLegacy"
                            color="secondary"
                            className={`${styles.CancelButton} TextFieldFadeInTrans}`}
                            endIcon={<IoCloseCircleOutline />}
                          >
                            ביטול
                          </Button>
                          <Button
                            variant="contained"
                            color="primary"
                            className={`${styles.SaveButton} TextFieldFadeInTrans`}
                            endIcon={<AiOutlineSend className={styles.RotatedIcon} />}
                            onClick={(event) => this.onSubmitHandler(event)}
                            type="submit"
                          >
                            שמירה
                          </Button>
                          <Popover
                            trigger="legacy"
                            placement="top"
                            target="PopoverLegacy"
                            isOpen={this.state.popoverOpen}
                            toggle={this.PopOverToggle}
                          >
                            <PopoverHeader className={styles.CancelFormText}>
                              האם אתה בטוח?
                            </PopoverHeader>
                            <PopoverBody>
                              <div className={styles.sa}>
                                <div className={styles.saError}>
                                  <div className={styles.saErrorX}>
                                    <div className={styles.saErrorLeft}></div>
                                    <div className={styles.saErrorRight}></div>
                                  </div>
                                  <div className={styles.saErrorPlaceholder}></div>
                                  <div className={styles.saErrorFix}></div>
                                </div>
                              </div>
                              <div className={styles.CancelFormAlertButtons}>
                                <Button
                                  variant="contained"
                                  color="secondary"
                                  className="AlertCancelButton TextFieldFadeInTrans"
                                  onClick={this.PopOverToggle}
                                >
                                  לא
                                </Button>
                                <Button
                                  variant="contained"
                                  color="primary"
                                  className="AlertSaveButton TextFieldFadeInTrans"
                                  onClick={this.CloseTheForm}
                                >
                                  כן
                                </Button>
                              </div>
                            </PopoverBody>
                          </Popover>
                        </div>
                      </ThemeProvider>
                      {this.state.ValidationError ?
                        <Fade in={this.state.ValidationError} tag="h5" className="mt-3 ValidationError">
                          <Alert severity="warning">לא תקין, נסה/י לרענן דף זה.</Alert>
                        </Fade>
                        : null}
                    </form>
                  </form>
                  : null}
              </div>
            </ThemeProvider>
          </StylesProvider>
        </CacheProvider>
      </div >
    );
  }
}