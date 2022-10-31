import EditEinsatz from '../components/Spiel/EditEinsatz';

const Test = () => {
  return (
    <div>
      <EditEinsatz
        open={true}
        handleClose={() => null}
        spielId="cl9vvsrz6001ozu1dgdpaj888"
        spielerId="cl9vw3xzr0005zu1s9q3zlpka"
      />
    </div>
  );
};

export default Test;
