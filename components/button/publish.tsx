interface Ipageprops {
    disabled: boolean,
    publish: () => Promise<void>
}

const PublishButton = ({ disabled, publish }: Ipageprops) => {
    return (
        <button disabled={disabled} onClick={publish} className={`bg-primary-btn m-2 text-white p-2 rounded-md ${!disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>Publish</button>
    );
}

export default PublishButton;