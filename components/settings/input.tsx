interface Iprops {
    label: string
    value: string
    type?: string
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

const SettingInput: React.FC<Iprops> = ({ label, onChange, value, type = 'text' }) => {
    return (
        <div className="flex flex-col justify-center items-start">
            <label className="font-semibold text-xl mb-1" htmlFor={label}>{label} </label>
            <input className="p-2 border rounded-lg w-80 text-base" id={label} type={type} value={value} onChange={onChange} />
        </div>
    );
}

export default SettingInput;