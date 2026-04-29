return (
  <div>
    <h2>Manage Withdraw Requests</h2>

    {requests.length === 0 ? (
      <p>No requests found</p>
    ) : (
      <table border="1" width="100%">
        <thead>
          <tr>
            <th>User</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {requests.map((req) => (
            <tr key={req._id}>
              <td>{req.user?.email || "N/A"}</td>
              <td>${req.amount}</td>
              <td>{req.status}</td>

              <td>
                {req.status === "pending" && (
                  <>
                    <button onClick={() => handleApprove(req._id)}>
                      Approve
                    </button>

                    <button onClick={() => handleReject(req._id)}>
                      Reject
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </div>
);