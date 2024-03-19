function Alert(props){
  return(
    <>
      <div className="alert-container" ref={props.inputRef}>
        <div className="alert-logo"><img src={process.env.PUBLIC_URL + '/spriokit.svg'} /></div>
        <div className="alert-contents">
          <p>{props.contents}</p>
        </div>
      </div>
    </>
  )
}
export default Alert;