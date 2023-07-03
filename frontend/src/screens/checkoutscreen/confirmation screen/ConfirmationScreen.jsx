import React, { useContext } from "react";
import Confirmation from "../../../components/stepper checkout/Confirmation";
import { Context } from "../../../context/Context";

function ConfirmationScreen() {
  const { state, dispatch } = useContext(Context);
  const { settings } = state;
  return (
    <div className="mtb">
      {settings?.map((s, index) => (
        <div key={index}>
          <Confirmation
            express={s.express}
            expressCharges={s.expressCharges}
            standardCharges={s.standardCharges}
            tax={s.tax}
            currencySign={s.currencySign}
          />
        </div>
      ))}
    </div>
  );
}

export default ConfirmationScreen;
