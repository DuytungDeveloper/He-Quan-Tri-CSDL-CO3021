import React, { useState } from "react";
import { Range, getTrackBackground } from "react-range";

interface DoubleRangeSliderProps {
    min: number;
    max: number;
    step: number;
    initialValues: [number, number];
    onChange: (values: [number, number]) => void;
    formatValue?: (v: number) => string
}

const DoubleRangeSlider: React.FC<DoubleRangeSliderProps> = ({
    min,
    max,
    step,
    initialValues,
    onChange,
    formatValue = (v) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 9 }).format(v)
}) => {
    const [values, setValues] = useState<[number, number]>(initialValues);

    const handleChange = (newValues: number[]) => {
        setValues([newValues[0], newValues[1]]);
        onChange([newValues[0], newValues[1]]);
    };

    return (
        <div style={{}}>
            <Range
                values={values}
                step={step}
                min={min}
                max={max}
                onChange={handleChange}
                renderTrack={({ props, children }) => (
                    <div
                        {...props}
                        style={{
                            ...props.style,
                            height: "6px",
                            width: "100%",
                            background: getTrackBackground({
                                values,
                                colors: ["#ccc", "#548BF4", "#ccc"],
                                min,
                                max,
                            }),
                            borderRadius: "3px",
                        }}
                    >
                        {children}
                    </div>
                )}
                renderThumb={({ props, isDragged, index }) => (
                    <div
                        {...props}
                        key={index}
                        style={{
                            ...props.style,
                            height: "20px",
                            width: "20px",
                            borderRadius: "50%",
                            backgroundColor: isDragged ? "#548BF4" : "#CCC",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            boxShadow: "0px 2px 6px #AAA",
                        }}
                    >
                        <div
                            style={{
                                height: "8px",
                                width: "8px",
                                backgroundColor: isDragged ? "#FFF" : "#CCC",
                                borderRadius: "50%",
                            }}
                        />
                    </div>
                )}
            />
            <div style={{ display: "flex", justifyContent: "space-between" }} className="mt-4">
                <span>{formatValue(values[0])}</span>
                <span>{formatValue(values[1])}</span>
            </div>
        </div>
    );
};

export default DoubleRangeSlider;