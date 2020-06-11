import React, { useEffect } from "react"

function FlashMessages(props) {
  return (
    <div className="floating-alerts">
      {props.messages.map((msg, index) => {
        return (
          <div key={index} className="alert alert-success text-centre floating-alert shadow-sm">
            {msg}
          </div>
        )
      })}
    </div>
  )
}

export default FlashMessages
