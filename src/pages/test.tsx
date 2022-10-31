import EditEinsatz from '../components/Spiel/EditEinsatz';

const Test = () => {
  return (
    <div>
      <EditEinsatz
        open={true}
        handleClose={() => null}
        spielId="cl6y1p26q0109dwp655jh1vlo"
        spielerId="cl6y1fh6d00013sp6ycj2wyzl"
      />
    </div>
  );
};

export default Test;
