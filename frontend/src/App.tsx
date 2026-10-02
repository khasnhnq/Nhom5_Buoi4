import { useEffect, useState } from "react";
import {
  BrowserProvider,
  Contract,
  JsonRpcProvider,
  formatUnits,
  parseUnits,
} from "ethers";

import { CHAIN_A, CHAIN_B, TOKEN_ABI, SRC_ABI, DST_ABI } from "./config";

import "./App.css";

function App() {
  const [diaChi, setDiaChi] = useState<string | null>(null);
  const [signer, setSigner] = useState<any>(null);

  const [soDuA, setSoDuA] = useState("0");
  const [soDuB, setSoDuB] = useState("0");

  const [soLuong, setSoLuong] = useState("");
  const [trangThai, setTrangThai] = useState("");

  const [dangChuyen, setDangChuyen] = useState(false);
  const [tenMang, setTenMang] = useState("");

  // =============================
  // KET NOI METAMASK
  // =============================
  async function ketNoiVi() {
    try {
      if (!(window as any).ethereum) {
        setTrangThai("Chua cai MetaMask.");
        return;
      }

      const provider = new BrowserProvider((window as any).ethereum);

      await provider.send("eth_requestAccounts", []);

      const network = await provider.getNetwork();

      if (Number(network.chainId) !== CHAIN_A.chainId) {
        setTrangThai("Ban dang o sai mang. Hay chuyen sang Chuoi A.");
        return;
      }

      const s = await provider.getSigner();
      const address = await s.getAddress();

      setSigner(s);
      setDiaChi(address);
      setTenMang(CHAIN_A.ten);

      await docSoDu(s, address);

      setTrangThai("Ket noi vi thanh cong.");
    } catch (err: any) {
      xuLyLoi(err);
    }
  }

  // =============================
  // DOC SO DU HAI CHUOI
  // =============================
  async function docSoDu(currentSigner: any, address: string) {
    try {
      const tokenA = new Contract(CHAIN_A.token, TOKEN_ABI, currentSigner);

      const balanceA = await tokenA.balanceOf(address);

      setSoDuA(formatUnits(balanceA, 18));

      const providerB = new JsonRpcProvider(CHAIN_B.rpc);

      const wrappedAbi = [
        "function balanceOf(address account) view returns (uint256)",
      ];

      const wrapped = new Contract(CHAIN_B.wrapped, wrappedAbi, providerB);

      const balanceB = await wrapped.balanceOf(address);

      setSoDuB(formatUnits(balanceB, 18));
    } catch (error) {
      console.error(error);
    }
  }

  // =============================
  // CHUYEN TOKEN
  // =============================
  async function chuyenToken() {
    if (!signer || !diaChi) {
      setTrangThai("Hay ket noi vi truoc.");
      return;
    }

    if (!soLuong || Number(soLuong) <= 0) {
      setTrangThai("Hay nhap so luong token hop le.");
      return;
    }

    try {
      setDangChuyen(true);

      const amount = parseUnits(soLuong, 18);

      const token = new Contract(CHAIN_A.token, TOKEN_ABI, signer);

      const bridge = new Contract(CHAIN_A.bridge, SRC_ABI, signer);

      // BUOC 1: APPROVE
      const allowance = await token.allowance(diaChi, CHAIN_A.bridge);

      if (allowance < amount) {
        setTrangThai("1/3 - Dang cho ban cap quyen...");

        const approveTx = await token.approve(CHAIN_A.bridge, amount);

        await approveTx.wait();
      }

      // BUOC 2: LOCK
      setTrangThai("2/3 - Dang khoa token o chuoi A...");

      const lockTx = await bridge.lock(diaChi, amount, CHAIN_B.chainId);

      await lockTx.wait();

      // BUOC 3
      setTrangThai("3/3 - Dang cho relayer chuyen tiep...");
    } catch (err: any) {
      xuLyLoi(err);
      setDangChuyen(false);
    }
  }

  // =============================
  // XU LY LOI METAMASK
  // =============================
  function xuLyLoi(err: any) {
    console.error(err);

    // Nguoi dung bam Reject / Cancel tren MetaMask
    if (
      err?.code === "ACTION_REJECTED" ||
      err?.code === 4001 ||
      err?.info?.error?.code === 4001 ||
      err?.error?.code === 4001
    ) {
      setTrangThai("Ban da huy giao dich.");
      return;
    }

    const message = err?.message?.toLowerCase() || "";

    // Khong du ETH tra phi gas
    if (
      err?.code === -32000 ||
      err?.info?.error?.code === -32000 ||
      message.includes("insufficient funds")
    ) {
      setTrangThai("Vi cua ban khong du ETH de tra phi.");
      return;
    }

    // Cac loi khac
    setTrangThai("Co loi xay ra, vui long thu lai.");
  }

  // =============================
  // LANG NGHE CHAIN B
  // =============================
  useEffect(() => {
    if (!diaChi) return;

    const providerB = new JsonRpcProvider(CHAIN_B.rpc);

    const bridgeB = new Contract(CHAIN_B.bridge, DST_ABI, providerB);

    const xuLy = async (_messageId: string, to: string, _amount: bigint) => {
      if (to.toLowerCase() === diaChi.toLowerCase()) {
        setTrangThai("Hoan tat! Token da co o chuoi B.");

        setDangChuyen(false);

        if (signer) {
          await docSoDu(signer, diaChi);
        }
      }
    };

    bridgeB.on("TokensMinted", xuLy);

    return () => {
      bridgeB.off("TokensMinted", xuLy);
    };
  }, [diaChi, signer]);

  return (
    <div className="app">
      <div className="card">
        <h1>Cross-Chain Bridge</h1>

        <p className="subtitle">MSSV 104087</p>

        {!diaChi ? (
          <button className="connect" onClick={ketNoiVi}>
            Ket noi vi
          </button>
        ) : (
          <>
            <div className="info">
              <p>
                <strong>Vi:</strong> {diaChi}
              </p>

              <p>
                <strong>Mang:</strong> {tenMang}
              </p>
            </div>

            <div className="balances">
              <div>
                <span>Chuoi A</span>
                <strong>{soDuA} TLB</strong>
              </div>

              <div>
                <span>Chuoi B</span>
                <strong>{soDuB} wTLB</strong>
              </div>
            </div>

            <div className="transfer">
              <label>So luong token</label>

              <input
                type="number"
                min="0"
                placeholder="Vi du: 100"
                value={soLuong}
                onChange={(e) => setSoLuong(e.target.value)}
                disabled={dangChuyen}
              />

              <button onClick={chuyenToken} disabled={dangChuyen}>
                {dangChuyen ? "Dang xu ly..." : "Chuyen sang chuoi B"}
              </button>
            </div>
          </>
        )}

        {trangThai && <div className="status">{trangThai}</div>}
      </div>
    </div>
  );
}

export default App;
