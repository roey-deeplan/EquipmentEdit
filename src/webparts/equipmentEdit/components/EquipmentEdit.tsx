import * as React from "react"
import { getSP } from "../pnpjs-config"
import styles from "./EquipmentEdit.module.scss"
import type { IEquipmentEditProps } from "./IEquipmentEditProps"
import { IEquipmentEditStates } from "./EquipmentEditStates"
import Swal from "sweetalert2"
import { Popover, PopoverHeader, PopoverBody, Fade, Input, InputGroup, Container } from "reactstrap"
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
import stylisRTLPlugin from "stylis-plugin-rtl"
import { CacheProvider } from "@emotion/react"
import createCache from "@emotion/cache"

const { solution } = require("../../../../config/package-solution.json")

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
			formIsActiveStatus: false,
			departmentManager: "",
			departmentManagerRole: "",
			userName: "",
			Email: "",
			CEOName: "",
			statusApproval: "בתהליך אישורים",
			DPMStatusApproval: "בחר",
			CEOStatusApproval: "בחר",
			isManager: false,
			departmentManagerSignture: "",
			CEOSignture: "",
			departmentManagerNotes: "",
			CEONotes: "",
			isCEO: false,
		}
	}

	public sp: any
	public id: number = 77
	// Use for direction rtl
	cacheRtl = createCache({
		key: "muirtl",
		stylisPlugins: [stylisRTLPlugin],
	})

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
		// get the item by id in the url
		const url = new URL(window.location.href)
		const FormID = Number(url.searchParams.get("FormID"))
		this.sp.web.lists
			.getById(this.props.ordersList)
			.items.getById(this.id)()
			.then((item: any) => {
				console.log("item:", item)
				this.setState({
					userName: item.Title,
					requestDate: item.DateOfRequest,
					userDepartment: item.Department,
					hardwareTypesList: item.HardwareType,
					orderReason: item.OrderReason,
					wearDescription: item.WearDescription === null || item.WearDescription === undefined ? "" : item.WearDescription,
					wearIsShown: item.WearDescription === null || item.WearDescription === undefined || item.WearDescription === "" ? false : true,
					requestDetail: item.DetailRequest,
					Email: item.Email,
					DPMStatusApproval: item.DepartmentManagerStatus,
				})
				if (item.DepartmentManagerStatus === "מאושר" || item.DepartmentManagerStatus === "לא מאושר") {
					this.setState({
						DPMStatusApproval: item.DepartmentManagerStatus,
						departmentManagerSignture: item.DPMSignature,
						departmentManagerNotes: item.DPMNotes,
						departmentManager: item.DepartmentManagerApproval,
						departmentManagerRole: item.DepartmentManagerRole,
					})
				}
				if (item.CEOStatus === "מאושר" || item.CEOStatus === "לא מאושר") {
					this.setState({
						CEOStatusApproval: item.CEOStatus,
						CEOSignture: item.CEOSignature,
						CEONotes: item.CEONotes,
					})
				}
			})
			.then(() => {
				// get all the items from the list 'Company Departments'.
				this.sp.web.lists
					.getById(this.props.companyDepartmentsList)
					.items()
					.then((companies: any[]) => {
						console.log("companies:", companies)
						this.setState({ companyDepartments: companies })
						// Set the CEO name.
						for (let i = 0; i < companies.length; i++) {
							const element = companies[i]
							if (element.Role === 'מנכ"ל החברה') {
								this.setState({ CEOName: element.DepartmentManagerName })
							}
						}
					})
					.then(() => {
						// get current user
						//const userEmail = "pnina@deeplan.co.il" //this.state.Email
						//const userEmail = "liron@deeplan.co.il" //this.state.Email
						//const userEmail = "carmi@deeplan.co.il" //this.state.Email
						const userEmail = this.state.Email
						console.log("userEmail:", userEmail)
						this.sp.web.currentUser //.siteUsers
							//.getByEmail(userEmail)()
							.select()()
							.then((user: any) => {
								console.log("user:", user)
								this.setState({ currentUser: user })
								console.log(this.state.userDepartment)
								this.companyDepartmentHandler(this.state.userDepartment)
								this.setState({ isLoading: false, formIsActiveStatus: true })
							})
							.catch((error: any) => console.error(error))
					})
					.catch((error: any) => console.error(error))
			})
			.catch((error: any) => console.error(error))
	}

	// Submit all the data only if the requierd fields are filled
	onSubmitHandler = (event: any) => {
		event.preventDefault()
		this.setState({
			isLoading: true,
		})
		const list = this.sp.web.lists.getById(this.props.ordersList)
		console.log(this.state.departmentManagerNotes)
		list.items
			.getById(this.id)
			.update({
				DepartmentManagerStatus: this.state.DPMStatusApproval,
				CEOStatus: this.state.CEOStatusApproval,
				DPMNotes: this.state.departmentManagerNotes,
				CEONotes: this.state.CEONotes,
				RequestStatus: this.state.statusApproval,
				DPMSignature: this.state.departmentManagerSignture,
				CEOSignature: this.state.CEOSignture,
				DepartmentManagerApproval: this.state.departmentManager,
				DepartmentManagerRole: this.state.departmentManagerRole,
			})
			.then(() => {
				this.setState({
					isLoading: false,
				})
				// Show a success message
				Swal.fire({
					position: "center",
					icon: "success",
					title: "הטופס נשלח בהצלחה",
					showConfirmButton: false,
					timer: 2000,
				})
				// Delay the navigation for 2 seconds
				setTimeout(() => {
					// Redirect or navigate to the desired link
					window.location.href = this.props.ReturnLink
				}, 2000)
			})
			.catch((error: any) => {
				console.error("Error updating item:", error)
			})
	}

	// Close Validation Error message after 3 seconds
	CloseValidationErrorMessage = () => {
		setTimeout(() => {
			this.setState({
				ValidationError: false,
			})
		}, 3000)
	}

	// Change the state of the user department
	companyDepartmentHandler(Department: string) {
		if (this.state.currentUser.Email.toLowerCase() === "carmi@deeplan.co.il") {
			if (this.state.DPMStatusApproval === "מאושר") {
				// When the CEO is the current user
				this.setState({
					isCEO: true,
				})
			}
		} else {
			const department = this.state.companyDepartments.find((company: any) => company.Title === Department)
			console.log("department:", department)
			this.setState({
				departmentId: department?.Id,
				departmentManager: department?.DepartmentManagerName,
				departmentManagerRole: department?.Role,
			})
			console.log("department.DepartmentManagerEmail:", department.DepartmentManagerEmail.toLowerCase())
			console.log("this.state.currentUser.Email:", this.state.currentUser.Email.toLowerCase())
			if (department.DepartmentManagerEmail.toLowerCase() === this.state.currentUser.Email.toLowerCase()) {
				this.setState({
					isManager: true,
				})
			}
		}
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
			let dd = String(ReleventDate.getDate())
			let mm = String(ReleventDate.getMonth() + 1) //January is 0!
			let yyyy = String(ReleventDate.getFullYear())
			if (parseInt(dd) < 10) {
				dd = "0" + dd
			}
			if (parseInt(mm) < 10) {
				mm = "0" + mm
			}

			// Create web format
			let FormattedReleventDate = dd + "/" + mm + "/" + yyyy

			return FormattedReleventDate
		} else {
			return null
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
		window.location.href = this.props.ReturnLink
	}

	// Pop over the little modal for closing the form
	PopOverToggle = () => {
		this.setState({
			popoverOpen: !this.state.popoverOpen,
		})
	}

	// Only the approval himself can change the status (DPM)
	statusApprovalChangeDPM = (event: any): void => {
		this.setState({
			DPMStatusApproval: event.target.value,
		})
		if (event.target.value === "מאושר" || event.target.value === "לא מאושר") {
			this.setState({
				departmentManagerSignture: this.state.currentUser.Title + " " + this.ConvertToDisplayDate(new Date()),
			})
		} else {
			this.setState({
				departmentManagerSignture: "",
			})
		}
	}

	// Only the approval himself can change the status (CEO)
	statusApprovalChangeCEO = (event: any): void => {
		this.setState({
			CEOStatusApproval: event.target.value,
		})
		if (event.target.value === "מאושר" || event.target.value === "לא מאושר") {
			this.setState({
				CEOSignture: this.state.currentUser.Title + " " + this.ConvertToDisplayDate(new Date()),
				statusApproval: event.target.value,
			})
		} else {
			this.setState({
				CEOSignture: "",
			})
		}
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
								{this.state.isLoading ? (
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
								) : null}
								{this.state.formIsActiveStatus ? (
									<form className={styles.containerForm}>
										<div className={styles.colForm}>
											<p className={styles.rowFormName}>שם העובד</p>
											<div>
												<PeoplePicker
													context={this.props.context as any}
													personSelectionLimit={1}
													showtooltip={false}
													required={true}
													defaultSelectedUsers={[this.state.userName]}
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
												style={{ direction: "rtl" }}
												disablePortal
												id="combo-box-demo"
												options={this.state.companyDepartments.map((department: any) => department.Title)}
												onChange={(newValue: any) => this.setState({ userDepartment: newValue })}
												value={this.state.userDepartment}
												defaultValue={"אחר"}
												renderInput={(params) => (
													<TextField {...params} className={styles.textFieldHw} required variant="standard" InputProps={{ ...params.InputProps }} />
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
													style={{ direction: "rtl" }}
													disablePortal
													id="combo-box-demo"
													options={this.state.hardwareTypesList}
													multiple
													onChange={this.hardwareTypeHandler}
													value={this.state.hardwareTypesList}
													renderInput={(params) => (
														<TextField
															className={styles.textFieldHw}
															required
															variant="standard"
															helperText={this.state.selectedHardwareTypesValidationError ? "נא לבחור לפחות פריט אחד" : ""}
															error={this.state.selectedHardwareTypesValidationError}
															{...params}
														/>
													)}
													renderTags={(value, getTagProps) =>
														value.map((option, index) => <Chip label={option} color="primary" variant="outlined" {...getTagProps({ index })} />)
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
																this.setState({ orderReason: event.target.value })
																if (event.target.value === "חדש") {
																	this.setState({ wearDescription: "" })
																	this.setState({ wearIsShown: false })
																} else if (event.target.value === "בלאי") {
																	this.setState({ wearIsShown: true })
																}
															}}
															value={this.state.orderReason}
															defaultValue={this.state.orderReason}
															inputProps={{ "aria-label": "Without label" }}
														>
															<MenuItem value={"חדש"}>חדש</MenuItem>
															<MenuItem value={"בלאי"}>בלאי</MenuItem>
														</Select>
													</Tooltip>
												</FormControl>
												{this.state.wearIsShown && (
													<>
														<div className={styles.rowTextFieldWear}>
															<p className={styles.rowFormName}>פרט:</p>
														</div>
														<TextField
															disabled
															style={{ width: "100%" }}
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
													</>
												)}
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
										<div className={styles.tableDiv}>
											<table className="table text-center">
												<thead>
													<tr>
														<th>שם המאשר</th>
														<th>תפקיד</th>
														<th>סטטוס</th>
														<th>חתימה</th>
														<th>הערות</th>
													</tr>
												</thead>
												<tbody>
													<tr>
														<td>
															<TextField size="small" disabled label={this.state.departmentManager}></TextField>
														</td>
														<td>
															<TextField size="small" disabled label={this.state.departmentManagerRole}></TextField>
														</td>
														<td>
															<FormControl size="small" variant="outlined">
																<Select
																	value={this.state.DPMStatusApproval}
																	defaultValue={"בחר"}
																	inputProps={{ "aria-label": "Without label" }}
																	onChange={(event: any) => {
																		this.statusApprovalChangeDPM(event)
																	}}
																	disabled={!this.state.isManager}
																>
																	<MenuItem value={"בחר"}>בחר</MenuItem>
																	<MenuItem value={"מאושר"}>מאושר</MenuItem>
																	<MenuItem value={"לא מאושר"}>לא מאושר</MenuItem>
																</Select>
															</FormControl>
														</td>
														<td>
															<TextField size="small" disabled value={this.state.departmentManagerSignture}></TextField>
														</td>
														<td>
															<TextField
																size="small"
																onChange={(event) => this.setState({ departmentManagerNotes: event.target.value })}
																value={this.state.departmentManagerNotes}
																disabled={!this.state.isManager}
																multiline
																rows={2}
															></TextField>
														</td>
													</tr>
													<tr>
														<td>
															<TextField size="small" disabled value={this.state.CEOName}></TextField>
														</td>
														<td>
															<TextField size="small" disabled value={'מנכ"ל'}></TextField>
														</td>
														<td>
															<FormControl size="small" variant="outlined">
																<Select
																	value={this.state.CEOStatusApproval}
																	defaultValue={"בחר"}
																	inputProps={{ "aria-label": "Without label" }}
																	onChange={(event: any) => this.statusApprovalChangeCEO(event)}
																	disabled={!this.state.isCEO}
																>
																	<MenuItem value={"בחר"}>בחר</MenuItem>
																	<MenuItem value={"מאושר"}>מאושר</MenuItem>
																	<MenuItem value={"לא מאושר"}>לא מאושר</MenuItem>
																</Select>
															</FormControl>
														</td>
														<td>
															<TextField size="small" disabled value={this.state.CEOSignture}></TextField>
														</td>
														<td>
															<TextField
																size="small"
																onChange={(event) => this.setState({ CEONotes: event.target.value })}
																value={this.state.CEONotes}
																disabled={!this.state.isCEO}
																multiline
																rows={2}
															></TextField>
														</td>
													</tr>
												</tbody>
											</table>
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
														type="submit"
														onClick={this.onSubmitHandler}
													>
														שמירה
													</Button>
													<Popover trigger="legacy" placement="top" target="PopoverLegacy" isOpen={this.state.popoverOpen} toggle={this.PopOverToggle}>
														<PopoverHeader className={styles.CancelFormText}>האם אתה בטוח?</PopoverHeader>
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
																<Button variant="contained" color="primary" className="AlertSaveButton TextFieldFadeInTrans" onClick={this.CloseTheForm}>
																	כן
																</Button>
															</div>
														</PopoverBody>
													</Popover>
												</div>
											</ThemeProvider>
											{this.state.ValidationError ? (
												<Fade in={this.state.ValidationError} tag="h5" className="mt-3 ValidationError">
													<Alert severity="warning">לא תקין, נסה/י לרענן דף זה.</Alert>
												</Fade>
											) : null}
										</form>
									</form>
								) : null}
							</div>
						</ThemeProvider>
					</StylesProvider>
				</CacheProvider>
			</div>
		)
	}
}
